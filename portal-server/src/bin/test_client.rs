use anyhow::Result;
use portal_proto::{DirTree, DirTreeItem, ListDirRequest, client::PortalClient};

use tonic::Request;

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
