import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'redux';
import { combineReducers } from 'redux';

// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

const todo = (state = {}, action) => {
	switch (action.type) {
		case 'ADD_TODO':
			return {
				id: action.id,
				text: action.text,
				completed: false
			};
		case 'TOGGLE_TODO':
			if (state.id !== action.id) {
				return state;
			}

			return {
				...state,
				completed: !state.completed
			};
		default:
			return state;
	}
};

const todos = (state = [], action) => {
	switch (action.type) {
		case 'ADD_TODO':
			return [
				...state,
				todo(undefined, action)
			];
		case 'TOGGLE_TODO':
			return state.map((t) => todo(t, action));
		default:
			return state;
	}
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
	switch(action.type) {
		case 'SET_VISIBILITY_FILTER':
			return action.filter;
		default:
			return state;
	}
};

const todoApp = combineReducers({todos, visibilityFilter});

let store = createStore(todoApp);

const Link = ({active, onClick, children}) => {
	if(active) {
		return <span>{children}</span>;
	}
	return (
		<a 
			href='#' 
			onClick={e => {
				e.preventDefault();
				onClick();
			}}
		>
			{children}
		</a>
	);
};

class FilterLink extends React.Component {
	componentDidMount() {
		this.unsubscribe = store.subscribe(() => 
			this.forceUpdate()
		);
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const props = this.props;
		const state = store.getState();

		return (
			<Link
				active={props.filter === state.visibilityFilter}
				onClick={() => 
					store.dispatch({
						type: 'SET_VISIBILITY_FILTER',
						filter: props.filter
					})
				}
			>
				{props.children}
			</Link>
		);
	}
}

const getVisibleTodos = (todos, filter) => {
	switch(filter) {
		case 'SHOW_COMPLETED':
			return todos.filter(todo => todo.completed);
		case 'SHOW_ACTIVE':
			return todos.filter(todo => !todo.completed);
		default:
			return todos;
	}
};

const Todo = ({onClick, completed, text}) => {
	return (
		<li onClick={onClick}
			style={{
				textDecoration: completed ? 'line-through' : 'none'
			}}
		>
			{text}
		</li>
	);
};

const TodoList = ({todos, onTodoClick}) => {  
	return (
		<ul>
			{todos.map(todo =>
				<Todo key={todo.id} onClick={() => onTodoClick(todo.id)} {...todo} />
			)}
		</ul>
	);
};

const AddTodo = ({onAddClick}) => {
	let input;

	return (
		<div>
			<input ref={node => {
				input = node;
			}}/>
			<button 
				onClick={() => {
					onAddClick(input.value);
					input.value = '';
				}}
			>
				Add Todo
			</button>
		</div>
	);
};

const Footer = ({visibilityFilter, onFilterClick}) => {
	return (
		<p>
			Show:
			{' '}
			<FilterLink
				filter='SHOW_ALL'
			>
				All
			</FilterLink>
			{', '}
			<FilterLink
				filter='SHOW_ACTIVE'
			>
				Active
			</FilterLink>
			{', '}
			<FilterLink
				filter='SHOW_COMPLETED'
			>
				Completed
			</FilterLink>
		</p>
	);
};

let nextTodoId = 0;
const TodoApp = ({todos, visibilityFilter}) => {
	return (
		<div>
			<AddTodo
				onAddClick={text =>
					store.dispatch({
						type: 'ADD_TODO',
						text,
						id: nextTodoId++
					})
				}
			/>
			<TodoList 
				todos={getVisibleTodos(todos, visibilityFilter)}
				onTodoClick={id =>
					store.dispatch({
						type: 'TOGGLE_TODO',
						id
					})
				}
			/>
			<Footer 
				visibilityFilter={visibilityFilter}
				onFilterClick={filter => {
					store.dispatch({
						type: 'SET_VISIBILITY_FILTER',
						filter
					});
				}}
			/>
		</div>
	);
}

const render = () => {
	ReactDOM.render(<TodoApp {...store.getState()} />, document.getElementById('root'));
};

store.subscribe(render);

render();