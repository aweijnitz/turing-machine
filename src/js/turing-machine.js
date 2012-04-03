/**
 * Turing machine implementation.
 * Author: Anders Weijnitz
 * Date: 2012-03-25
 * Licence: MIT
 *
 * file:///Users/andersw/javascript/turing-machine/src/turing.html
 */

/** Simple object factory. 
 * Similar to Crockford's and inspired from 
 * http://stackoverflow.com/questions/2709612/using-object-create-instead-of-new
 * Adds an Object.build method to create objects from a prototype 
 * and then call the init method, if defined.
 *
 * Example use: 
 * var aState = Object.build(EmptyState,'s0','0','1','RIGHT','s1')
 */
if(typeof Object.build !== 'function') {
	Object.build = function(o) {
	   var initArgs = Array.prototype.slice.call(arguments,1)
	   function F() {
	      if((typeof o.init === 'function') && initArgs.length) {
	         o.init.apply(this,initArgs)
	      }
	   }
	   F.prototype = o
	   return new F()
	}
}


/* Create DOM-backed tape object which will be initialized by 
 * the page and passed to the turing machine 
 */
DOMTape = {
	_tape : null,			// jQuery node
	_current_cell : null,	// jQuery node
	_start_cell: null,		// jQuery node
	'init': function(tape_node, start_node) {
		this._tape = tape_node;
		this._current_cell = start_node;
		this._start_cell = start_node;
		return this;
	},
	rewindToStart: function () {
		return this.setCurrentCell(this._start_cell);
	}
	,
	eraseAndRewind: function() {
		this._tape.empty();
		this._tape.append(this._start_cell);
		this.rewindToStart();
	},
	leftEnd: function() {
		return this._tape.children().filter(":first");
	},
	rightEnd: function() {
		return this._tape.children().filter(":last");
	},
	extendLeft: function() {
		this.leftEnd().before("<div class='tape-cell'>0</div>");
		return this.leftEnd();
	},
	extendRight: function() {
		this.rightEnd().after("<div class='tape-cell'>0</div>");	
		return this.rightEnd();		
	},
	currentCell: function() {
		return this._current_cell;
	},
	setCurrentCell: function(node) {
		this._current_cell.removeClass("current-cell");
		node.addClass("current-cell");
		this._current_cell = node;
		return this._current_cell;
	},
	readSymbol: function() {
		return this.currentCell().html();
	},
	writeSymbol: function(symbol) {
		return this.currentCell().html(symbol);
	},
	moveLeft: function() {
		var cell = this.currentCell().prev();
		if(cell.length == 1) {
			return this.setCurrentCell(cell);
		} 
		this.setCurrentCell(this.extendLeft());
		return this._current_cell;
	},
	moveRight: function() {
		var cell = this.currentCell().next();
		if(cell.length == 1) {
			return this.setCurrentCell(cell);
		} 
		this.extendRight();
		this.setCurrentCell(this.rightEnd());
		return this._current_cell;
	}
};

/** Main object. The currently running Turing machine.
 * A tape object for storage needs to be supplied for the machine to work.
 * Must have methods:
 * moveLeft(), moveRight(), writeSymbol(), readSymbol(), rewindToStart()
 */
TuringMachine = {
	_tape : null,
	current_state : null, 	// The name (id) of the current state
	start_state : null, 	// The name (id) of the original start state
	current_symbol : '0',	// Last read symbol from tape
	states : {}, 			// The definition of the state machine ("the program")
	addState : function(state) {
		this.states[state.current_state] = state;
		return this;
	},
	setStartState: function(state) {
		this.start_state = state.current_state;
		this.current_state = state.current_state;
	},
	getStateByName: function(state_name) {
		return this.states[state_name];
	},
	getCurrentState: function() {
		return this.current_state;
	},
	reset : function() {
		this.current_state = this.start_state;
		this.current_symbol = '0'; // Reset the single memory cell
		this._tape.eraseAndRewind();
		return this;
	},
	/** Evaluate the current rule to generate next state
	*/
	nextState : function() {
		var state = this.getStateByName(this.current_state);
		this.current_symbol = this._tape.readSymbol();

		// Check match with input
		//
		// If the tape cell matches the rule
		// execute the write action and move head
		// according to the rule to get to next state.
		if(state.tape_symbol == this.current_symbol) {
			this._tape.writeSymbol(state.write_symbol);
			
			if(state.tape_move == 'RIGHT')
				this._tape.moveRight();
			else if (state.tape_move == 'LEFT')
				this._tape.moveLeft();

			this.current_state = state.next_state;
		}
		return this;
	},
	setTape: function(tape) {
		return this._tape = tape;
	},
	getTape: function() {
		return this._tape;
	}
};


/** State prototype object
*/
EmptyState = {
	'current_state' : null, // State name, typically s0, s1, s2 ... sN
	'tape_symbol' : '0', // One of the symbols from the current alphabet {0,1}
	'write_symbol' : '0', // Output given the current state and current symbol
	'tape_move' : 'STAY', // Where to move tape head next (LEFT, RIGHT, STAY)
	'next_state' : null, // Where to go next
	'init': function(cs,ts,ws,tm,ns) {
		this.current_state = cs;
		this.tape_symbol = ts;
		this.write_symbol = ws;
		this.tape_move = tm;
		this.next_state = ns;
		return this;
	}
};



