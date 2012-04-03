 $(document).ready(function() {

 	/* Add some styling */
 	$("h1").wrap('<div class="primary-2 container-heading" />');
 	$("h2").wrap('<div class="primary-2 container-heading" />');
 	$("h3").wrap('<div class="primary-2 container-heading" />');
 	$("thead").addClass('primary-5');


	/* Add handlers */
	var interValId = 0;
	var running = false;
	var previousState = null;

 	$("#step").click(function() {
 		TuringMachine.nextState();
 		repaintStateMachine();
 	});

 	$("#run").click(function() {
 		// repeat nextState()
 		if(running) {
 			// pause
 			clearInterval(interValId);
 			running = false;
 			this.innerHTML = "Run";
 		} else {
 			// run
 			running = true;
 			this.innerHTML = "Pause";
 			interValId = setInterval(function() { TuringMachine.nextState(); repaintStateMachine(); }, 800);
 		}
 	});
 	
 	$("#reset").click(function() {
 		TuringMachine.reset();
 		repaintStateMachine();
 	});
 	

 	var repaintStateMachine = function() {
 		// Update the state machine to reflect current state
 		var currentState = TuringMachine.getCurrentState();
 		if(previousState != null) {
 			$("#"+previousState).removeClass('current-state').removeClass('complement-2');
 		}
 		$("#"+currentState).addClass("current-state").addClass('complement-2');
 		previousState = currentState;
 	}; 

	DOMTape.init($("#tape"),$("#start-cell"));

	// Load up simple program (Turing's first example) 
	// Produces 0101 ... ('0' is equal to BLANK in this machine)
	// [Current State, Tape Symbol to match, Write Symol if matched, Tape move, Next State]
	var s0 = Object.build(EmptyState,'s0','0','0','RIGHT','s1');
	var s1 = Object.build(EmptyState,'s1','0','1','RIGHT','s0');
	TuringMachine.addState(s0);
	TuringMachine.addState(s1);
	TuringMachine.setTape(DOMTape);
	TuringMachine.setStartState(s0);
	TuringMachine.reset();
	repaintStateMachine();

 });