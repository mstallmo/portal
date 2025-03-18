use std::fs;

use anyhow::Result;
use portal_proto::{
    DirTree, DirTreeItem, ListDirRequest, OpenFileRequest, client::PortalClient,
    file_content::Content,
};
use tonic::{Request, transport::Channel};

#[tokio::main]
async fn main() -> Result<()> {
    let mut client = PortalClient::connect("http://127.0.0.1:18244").await?;

    let response = client
        .list_dir(Request::new(ListDirRequest {
            path: std::env!("CARGO_MANIFEST_DIR").to_string(),
        }))
        .await?;

    println!("RESPONSE = {:?}\n", response);

    print_dir_tree(response.get_ref());

    let mut root = std::env!("CARGO_MANIFEST_DIR").to_string();
    root.push_str("/Cargo.toml");

    open_remote_file(&mut client, &root).await?;

    Ok(())
}

fn print_dir_tree(dir_tree: &DirTree) {
    for root in &dir_tree.roots {
        print_tree_item(root, "".to_string());
    }
}

fn print_tree_item(item: &DirTreeItem, parent: String) {
    if item.children.is_empty() {
        let child_path = if parent.is_empty() {
            item.path.clone()
        } else {
            let mut child_path = parent.clone();
            child_path.push_str(&format!("{}", &item.path));
            child_path
        };

        println!("{child_path}");
    } else {
        for child in &item.children {
            let mut new_parent = parent.clone();
            new_parent.push_str(&format!("{}/", &item.path));

            print_tree_item(child, new_parent);
        }
    }
}

async fn open_remote_file(
    client: &mut PortalClient<Channel>,
    file_path: impl AsRef<str>,
) -> Result<()> {
    println!("Opening remote file: {}", file_path.as_ref());
    let mut stream = client
        .open_file(Request::new(OpenFileRequest {
            path: file_path.as_ref().to_string(),
        }))
        .await?
        .into_inner();

    let mut file_buffer = Vec::new();
    while let Some(content) = stream.message().await? {
        if let Some(content) = content.content {
            match content {
                Content::Metadata(metadata) => {
                    println!("Metadata: {:?}", metadata);
                    file_buffer = Vec::with_capacity(metadata.size as usize);
                }
                Content::Data(mut data) => {
                    println!("Got file bytes");
                    file_buffer.append(&mut data);
                }
            }
        }
    }

    if file_buffer.is_empty() {
        println!("File had no data");
    } else {
        println!("Writing test_file.txt");
        fs::write("test_file.txt", &file_buffer)?;
    }

    Ok(())
}
