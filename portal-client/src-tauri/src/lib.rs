use portal_proto::{client::PortalClient, DirTree, ListDirRequest};
use std::sync::{Arc, Mutex};
use tauri::{async_runtime, Manager, State};
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
        .invoke_handler(tauri::generate_handler![list_dir])
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
