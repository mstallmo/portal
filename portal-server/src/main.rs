use anyhow::Result;
use portal_proto::{
    DirTree, DirTreeItem, FileContent, FileMetadata, ListDirRequest, OpenFileRequest, file_content,
    server::{Portal, PortalServer},
};
use std::{
    fs,
    path::{Path, PathBuf},
};
use tokio::{fs as tfs, io::AsyncReadExt, sync::mpsc};
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status, transport::Server};

#[tokio::main]
async fn main() -> Result<()> {
    let addr = "127.0.0.1:18244".parse()?;

    let portal = PortalService {};

    let svc = PortalServer::new(portal);

    Server::builder().add_service(svc).serve(addr).await?;

    Ok(())
}

#[derive(Debug)]
struct PortalService {}

#[tonic::async_trait]
impl Portal for PortalService {
    async fn list_dir(
        &self,
        request: Request<ListDirRequest>,
    ) -> Result<Response<DirTree>, Status> {
        let path = PathBuf::from(&request.get_ref().path);

        println!("Listing directory at {}", path.display());
        let mut items = vec![];
        // TODO: Handle `Status` Error
        read_all(&path, &mut items).unwrap();

        Ok(Response::new(DirTree { roots: items }))
    }

    type OpenFileStream = ReceiverStream<Result<FileContent, Status>>;

    async fn open_file(
        &self,
        request: Request<OpenFileRequest>,
    ) -> Result<Response<Self::OpenFileStream>, Status> {
        let file_path = request.into_inner().path;
        println!("Opening file {file_path}");

        let (tx, rx) = mpsc::channel(4);

        // TODO: Implement error handling
        tokio::spawn(async move {
            let mut file = tfs::File::open(file_path).await.unwrap();
            let file_size = file.metadata().await.unwrap().len();

            let metadata = FileMetadata {
                mime_type: "image/jpeg".to_string(),
                size: file_size,
            };

            let content = FileContent {
                content: Some(file_content::Content::Metadata(metadata)),
            };

            tx.send(Ok(content)).await.unwrap();

            let mut chunk = vec![0; 1_024 * 1_024];
            loop {
                let bytes_read = file.read(&mut chunk).await.unwrap();
                println!("Bytes read: {}", bytes_read);

                if bytes_read == 0 {
                    break;
                }

                chunk.truncate(bytes_read);

                let content = FileContent {
                    content: Some(file_content::Content::Data(chunk.clone())),
                };

                tx.send(Ok(content)).await.unwrap();
            }
        });

        Ok(Response::new(ReceiverStream::new(rx)))
    }
}

fn read_all(path: impl AsRef<Path>, items: &mut Vec<DirTreeItem>) -> Result<()> {
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        if entry.metadata()?.is_dir() {
            let mut sub_items = vec![];
            let _ = read_all(entry.path(), &mut sub_items)?;
            if sub_items.len() > 0 {
                let item = DirTreeItem {
                    path: entry.file_name().to_string_lossy().into_owned(),
                    children: sub_items,
                };

                items.push(item);
            }
        } else {
            let path = entry.file_name().to_string_lossy().into_owned();

            if path.starts_with(".") {
                continue;
            }

            let item = DirTreeItem {
                path,
                children: vec![],
            };

            items.push(item);
        }
    }

    Ok(())
}
