use anyhow::Result;
use portal_proto::{
    DirTree, DirTreeItem, ListDirRequest,
    server::{Portal, PortalServer},
};
use std::{
    fs,
    path::{Path, PathBuf},
};
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
            let item = DirTreeItem {
                path: entry.file_name().to_string_lossy().into_owned(),
                children: vec![],
            };

            items.push(item);
        }
    }

    Ok(())
}
