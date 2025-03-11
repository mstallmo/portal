use anyhow::{Error as E, Result};
use image::DynamicImage;
use ratatui::crossterm::event::{self, Event, KeyCode, KeyEventKind};
use ratatui::widgets::Block;
use ratatui::{DefaultTerminal, Frame, prelude::*};
use ratatui_image::{Resize, StatefulImage, picker::Picker};
use std::{
    env, fs,
    path::{Path, PathBuf},
};
use tui_tree_widget::{Tree, TreeItem, TreeState};

struct AppState<'a> {
    pub tree_items: Vec<TreeItem<'a, String>>,
    pub tree_state: TreeState<String>,
    pub picker: Picker,
    pub image: Option<DynamicImage>,
}

impl<'a> AppState<'a> {
    fn new() -> Result<Self> {
        let picker = Picker::from_query_stdio()?;
        let mut items = vec![];
        let _ = read_all(env::current_dir()?, &mut items);

        Ok(Self {
            tree_state: TreeState::default(),
            tree_items: items,
            picker,
            image: None,
        })
    }
}

fn read_all<'a, P: AsRef<Path>>(path: P, items: &mut Vec<TreeItem<'a, String>>) -> Result<()> {
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        if entry.metadata()?.is_dir() {
            let mut sub_items = vec![];
            let _ = read_all(entry.path(), &mut sub_items)?;
            if sub_items.len() > 0 {
                let item = TreeItem::new(
                    entry.path().to_string_lossy().to_string(),
                    entry.path().to_string_lossy().to_string(),
                    sub_items,
                )?;
                items.push(item);
            }
        } else {
            if is_image(&entry.path()) {
                let item = TreeItem::new_leaf(
                    entry.file_name().to_string_lossy().to_string(),
                    entry.path().to_string_lossy().to_string(),
                );
                items.push(item);
            }
        }
    }

    Ok(())
}

fn is_image(path: &Path) -> bool {
    match path.extension() {
        Some(extension) => match extension.to_str() {
            Some("jpg") | Some("jpeg") | Some("png") => true,
            _ => false,
        },
        None => false,
    }
}

fn main() -> Result<()> {
    color_eyre::install().map_err(E::msg)?;
    let state = AppState::new()?;

    let terminal = ratatui::init();
    let result = run(terminal, state);
    ratatui::restore();
    result
}

fn run(mut terminal: DefaultTerminal, mut state: AppState) -> Result<()> {
    if let Some(first_item) = state.tree_items.first() {
        state
            .tree_state
            .select(vec![first_item.identifier().to_owned()]);
    }

    loop {
        // Render view
        terminal.draw(|frame| {
            render(frame, &mut state);
        })?;

        // Handle events
        match event::read()? {
            Event::Key(key_event) => {
                if key_event.kind == KeyEventKind::Press {
                    match key_event.code {
                        KeyCode::Up | KeyCode::Char('k') => state.tree_state.key_up(),
                        KeyCode::Down | KeyCode::Char('j') => state.tree_state.key_down(),
                        KeyCode::Char(' ') | KeyCode::Enter => state.tree_state.toggle_selected(),
                        KeyCode::Char('q') => break,
                        _ => false,
                    };
                }
            }
            _ => {}
        }

        // Update state
        let selected_path = PathBuf::from(state.tree_state.selected().join("/"));
        if let Some(extension) = selected_path.extension() {
            if extension.to_str() == Some("jpg") && state.image.is_none() {
                let image = image::ImageReader::open(selected_path)?.decode()?;
                state.image = Some(image);
            } else {
                state.image = None;
            }
        } else {
            state.image = None;
        }
    }

    Ok(())
}

// Main render function
fn render(frame: &mut Frame, state: &mut AppState) {
    let layout = Layout::default()
        .direction(Direction::Horizontal)
        .constraints(vec![Constraint::Percentage(25), Constraint::Percentage(75)])
        .split(frame.area());

    file_explorer(frame, layout[0], state);
    image_viewer(frame, layout[1], state);
}

fn file_explorer(frame: &mut Frame, area: Rect, state: &mut AppState) {
    let tree_widget = Tree::new(&state.tree_items)
        .expect("all item identifiers are unique")
        .block(Block::bordered().title("Tree Widget"))
        .highlight_style(
            Style::new()
                .fg(Color::Black)
                .bg(Color::LightGreen)
                .add_modifier(Modifier::BOLD),
        )
        .highlight_symbol(">> ");
    frame.render_stateful_widget(tree_widget, area, &mut state.tree_state);
}

fn image_viewer(frame: &mut Frame, area: Rect, state: &mut AppState) {
    if let Some(image) = &state.image {
        let mut image_state = state.picker.new_resize_protocol(image.clone());
        let image_widget = StatefulImage::new();

        frame.render_stateful_widget(
            image_widget.resize(Resize::Crop(None)),
            area.inner(Margin::new(5, 2)),
            &mut image_state,
        );
    }
}
