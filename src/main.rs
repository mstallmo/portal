use color_eyre::Result;
use ratatui::crossterm::event::{self, Event, KeyCode, KeyEventKind};
use ratatui::widgets::Block;
use ratatui::{DefaultTerminal, Frame, prelude::*};
use std::{env, fs, path::Path};
use tui_tree_widget::{Tree, TreeItem, TreeState};

fn main() -> Result<()> {
    color_eyre::install()?;
    let state = AppState::default();

    let terminal = ratatui::init();
    let result = run(terminal, state);
    ratatui::restore();
    result
}

fn run(mut terminal: DefaultTerminal, mut state: AppState) -> Result<()> {
    loop {
        terminal.draw(|frame| {
            render(frame, &mut state);
        })?;

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
    }

    Ok(())
}

struct AppState<'a> {
    pub tree_items: Vec<TreeItem<'a, String>>,
    pub tree_state: TreeState<String>,
}

impl<'a> Default for AppState<'a> {
    fn default() -> Self {
        let mut items = vec![];
        read_all(env::current_dir().unwrap(), &mut items);

        Self {
            tree_state: TreeState::default(),
            tree_items: items,
        }
    }
}

// TODO: Fix unwrapping
fn read_all<'a, P: AsRef<Path>>(path: P, items: &mut Vec<TreeItem<'a, String>>) {
    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        if entry.metadata().unwrap().is_dir() {
            let mut sub_items = vec![];
            read_all(entry.path(), &mut sub_items);
            let item = TreeItem::new(
                entry.path().to_string_lossy().to_string(),
                entry.path().to_string_lossy().to_string(),
                sub_items,
            )
            .unwrap();
            items.push(item);
        } else {
            let item = TreeItem::new_leaf(
                entry.file_name().to_string_lossy().to_string(),
                entry.path().to_string_lossy().to_string(),
            );
            items.push(item);
        }
    }
}

// Main render function
fn render(frame: &mut Frame, state: &mut AppState) {
    let layout = Layout::default()
        .direction(Direction::Horizontal)
        .constraints(vec![Constraint::Percentage(25), Constraint::Percentage(75)])
        .split(frame.area());

    // frame.render_widget("hello world", layout[0]);
    file_explorer(frame, layout[0], state);
    frame.render_widget(state.tree_state.selected().join("/"), layout[1]);
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
