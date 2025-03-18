use portal_proto::{
    client::PortalClient, file_content::Content, DirTree, FileMetadata, ListDirRequest,
    OpenFileRequest,
};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use tauri::{async_runtime, ipc::Response, Manager, State};
use tonic::{transport::Channel, Request};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let handle = async_runtime::handle();
    let client = handle.block_on(async {
        let client = PortalClient::connect("http://127.0.0.1:18244")
            .await
            .unwrap();
        client
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Arc::new(Mutex::new(AppData { client })));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![list_dir, open_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

struct AppData {
    client: PortalClient<Channel>,
}

#[tauri::command]
async fn list_dir(state: State<'_, Arc<Mutex<AppData>>>, path: &str) -> Result<DirTree, String> {
    let mut client = state.lock().unwrap().client.clone();

    let res = client
        .list_dir(Request::new(ListDirRequest {
            path: path.to_string(),
        }))
        .await
        .map_err(|e| e.to_string())?;

    println!("Listing directory: {path}");
    println!("RESPONSE = {:?}\n", res);

    let dir_tree = res.into_inner();

    Ok(dir_tree)
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct FileContentHeader {
    mime_type: String,
}

impl From<FileMetadata> for FileContentHeader {
    fn from(metadata: FileMetadata) -> Self {
        FileContentHeader {
            mime_type: metadata.mime_type,
        }
    }
}

#[tauri::command]
async fn open_file(state: State<'_, Arc<Mutex<AppData>>>, path: &str) -> Result<Response, String> {
    let mut client = state.lock().unwrap().client.clone();

    let mut stream = client
        .open_file(Request::new(OpenFileRequest {
            path: path.to_string(),
        }))
        .await
        .map_err(|e| e.to_string())?
        .into_inner();

    let mut buffer = Vec::new();
    let mut counter = 0;
    while let Some(message) = stream.message().await.map_err(|e| e.to_string())? {
        if let Some(content) = message.content {
            match content {
                Content::Metadata(metadata) => {
                    if counter != 0 {
                        return Err("Protocol error: received metadata after data".to_string());
                    }

                    let content_size = metadata.size;
                    let header: FileContentHeader = metadata.into();
                    let serialized_header =
                        serde_json::to_string(&header).map_err(|e| e.to_string())?;
                    let header_bytes = serialized_header.as_bytes();

                    // Allocate enough space in the buffer for the header length, header,  and data
                    buffer.reserve(8 + header_bytes.len() + content_size as usize);

                    // Insert the length of the header at the beginning of the buffer.
                    // The length (usize) is encoded as a big-endian bytes to match the default
                    // endianness of JavaScript typed arrays.
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays
                    buffer.append(&mut header_bytes.len().to_be_bytes().to_vec());

                    // Insert the header bytes into the buffer
                    buffer.append(&mut header_bytes.to_vec());
                }
                Content::Data(mut data) => buffer.append(&mut data),
            }

            counter += 1;
        }
    }

    Ok(Response::new(buffer))
}
