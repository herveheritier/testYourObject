`Test` object offering test facilities
==

`Test.run(testedFn,expectedResult[[,ctrlFn],ctxtFn])` : run a test
-

To run a test, just call the `Test.run` function with 2, 3 or 4 arguments :
- testedFn : 
  is a function to test. Declare it as a callback function.
- expectedResult : 
  is the expected value by running the function to test
- ctrlFn : 
  is optionnaly to declare only when the 2nd argument is null ;
  it's an other callback function wich is used to control result of the  function to test.
  It's take one argument, the tested function result.
  And it must return a boolean value : true if the test is passed, else false if failed.
- ctxtFn : 
  is optionnaly to declare a callback function called after each performance cycle ;
  it could be necessary for example as a cleaner action before recalled the tested function.

Tested function, tested function result and check result are displayed.

The `Test.run` function logic is as is :
- increment the calling counter
- display the tested function code
- run the tested function
-- if the run raised an exception, the exception is emit on the console. In this cas, if the attempt value
   is an Error object it confirms the exception was expected ; the test is passed !
- if attempt result value is null
-- run the control function  and if result is ok then display the tested function result
- if attempt result value is not null
-- compare tested function result with attempt result  and if it's equalf then display the tested function result
- at all, display the check state (passed or failed)
- if test is passed (but not with a raised exception) rerun the tested function as much as requested to compute
  the elapsed time the display it. The rerun depends on the `Test.repeat` value equal to 1000 by default.

`Test.setRepeat(n)` : force the rerun `Test.repeat` value
--

`Test.results()` : display statistics
--

After running all tests, call the `Test.results` function to display statistics for all tests runned since the previous `Test.results` calling.
The calling reset the statistics.

Test result displayed into the devTools console
--

The natives console.log, console.group and console.groupEnd functions are refactored.
 Natively, they wrote into the devTools console.
  The refactoring routes messages into the DOM, so messages are displayed at the end of the html's body.

By default, they are also displayed into the devTools console, but it's possible to mute it ; this capability is reversible.

`Test.devToolsMute()` : mute the console.log function
`Test.devToolsLoud()` : activate the console.log function
