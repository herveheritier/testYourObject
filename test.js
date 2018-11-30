/*
(lang,EN:[
======================================
`Test` object offering test facilities
======================================

* Usage

To run a test, just call the `Test.run` function with 2, 3 or 4 arguments :
- 1st argument is a function to test. Declare it as a callback function.
- 2nd argument is the expected value by running the function to test
- 3rd argument is optionnaly to declare only when the 2nd argument is null ;
  it's an other callback function wich is used to control result of the  function to test.
  It's take one argument, the tested function result.
  And it must return a boolean value : true if the test is passed, else false if failed.
- 4th argument is optionnaly to declare a callback function called after each performance cycle ;
  it could be necessary for example as a cleaner action before recalled the tested function.

Tested function, tested function result and check result are displayed.

`Test.run(testedFunction,expectedResult,controlFunction)` : run a test

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

After running all tests, call the `Test.results` function to display statistics for all tests runned since the previous `Test.results` calling.
The calling reset the statistics.

`Test.results()` : display statistics

* Important information

The natives console.log, console.group and console.groupEnd functions are refactored.
 Natively, they wrote into the devTools console.
  The refactoring routes messages into the DOM, so messages are displayed at the end of the html's body.

By default, they are also displayed into the devTools console, but it's possible to mute it ; this capability is reversible.

`Test.devToolsMute()` : mute the console.log function
`Test.devToolsLoud()` : activate the console.log function

])
(lang,FR:[
==========================================
`Test` object propose des capacité de test
==========================================

* Utilisation

Pour exécuter un test, appelez la fonction `Test.run` avec 2, 3 ou 4 arguments :
- Le 1er argument est une fonction à tester. Déclarez-le comme fonction de callback.
- Le 2ème argument est la valeur attendue au retour de l'exécution de la fonction à tester
- Le 3ème argument (optionnel) est à déclarer seulement quand le 2ème argument est nul ;
  c'est une autre fonction de callback utilisée pour contrôler le résultat de la fonction à tester.
  Il nécessite un argument, le résultat de la fonction testée.
  Elle doit retourner une valeur booléenne : true si le test est réussi, false en cas d'échec.
- Le 4ème argument (optionnel) sert à déclarer une fonctionde callback appelée après chaque cycle du calcul des performances ;
  il peut être nécessaire par exemple pour faire du nettoyage avant de rappeler la fonction testée.

La fonction testée, le résultat de la fonction testée et le résultat du contrôle sont affichés.

`Test.run(testedFunction,attemptResult,controlFunction)` : exécuter un test

La logique de la fonction `Test.run` est :
- incrémenter le compteur d'appel
- afficher le code de la fonction testée
- exécuter la fonction testée
-- si l'exécution lève une exception, elle est récupérée et émise dans la console. Dans ce cas si la valeur attendue
   est l'object Error alors c'est bien que l'on attendait une exception ; le test est donc considéré comme réussi
- si la valeur du résultat attendu est null
-- exécuter la fonction de contrôle et si le résultat est correct, affichez le résultat de la fonction testée.
- si la valeur du résultat attendu n'est pas nul
-- comparer le résultat de la fonction testée avec le résultat attendu et s'il est égal, affichez le résultat de la fonction testée.
- afficher l'état du controle (réussi ou échoué)
- si le test est réussi (mais pas suite à une détection d'exception) alors la fonction testée est réexécutée
  autant de fois que demandé pour calculer le temps écoulé puis l'afficher. La répétition dépend de la valeur `Test.repeat` égale à 1000 par défaut

`Test.setRepeat(n)` : force la répétition du test `Test.repeat`

Après avoir exécuté tous les tests, appelez la fonction `Test.results` pour afficher les statistiques
pour tous les tests exécutés depuis le précédent appel de `Test.results`.
L'appel réinitialise les statistiques.

`Test.results()` : afficher les statistiques

* Information importante

Les fonctions natives console.log, console.group et console.groupEnd sont recodée.
Nativement, elles écrivent dans la console devTools.
Le nouveau code envoi les messages dans le DOM, de sorte que les messages sont affichés à la fin du body du html.
Par défaut, les messages sont aussi affichés dans la console devTools, mais il est possible d'interrompre cette sortie ; cette capacité est réversible.

`Test.devToolsMute()` : interromp la sortie de la fonction console.log
`Test.devToolsLoud()` : réactive la sortie de la fonction console.log

])
*/

const Test = {

    level : 1,
    count : 0,
    failed : 0,
    repeat : 1000,
    mute : false,
    testComponent : [],
    testTimer: null,

    /***** 
    (lang,EN:[
        reroute console functions log, group and groupEnd
    ])
    (lang,FR:[
        reroutage des fonctions log, group et groupEnd de l'objet console
    ])
    */

    done : (function(){
        var devToolsLog = console.log;
        console.log = function (message) {
            var pre = document.createElement('pre')
            pre.appendChild(document.createTextNode(message))
            document.querySelector("body").appendChild(pre)
            pre.style.display = 'none'
            pre.style.display = ''
            if(!Test.mute) devToolsLog.apply(console, arguments)
        };
        var devToolsGroup = console.group
        console.group = function (message) {
            var h = document.createElement('h'+Test.level)
            h.appendChild(document.createTextNode(message))
            document.querySelector("body").appendChild(h)
            if(!Test.mute) devToolsGroup.apply(console, arguments)
            Test.level++
        }
        var devToolsEnd = console.groupEnd
        console.groupEnd = function () {
            Test.level--
            if(!Test.mute) devToolsEnd.apply(console, arguments)
        }
    })(),

    /*
    (lang,EN:[
        deactivate / activate log display into devTolls console
        if inactive, route is exclusive
        if active, console message are route and send to the devTools console
    ])
    (lang,FR:[
        desactivation / activation de la log de la console du devTools
        si inactive, le reroutage est exclusif
        si active, les messages console sont à la fois rerouté et émis dans la console
    ])*/
    devToolsMute : () => Test.mute = true,
    devToolsLoud : () => Test.mute = false,

    /*
    (lang,EN:[
        set test repetition for performance mesurement
    ])
    (lang,FR:[
        valorise le nombre de repetition des test pour la mesure de performance
    ])
    */
    setRepeat : (repeat) => Test.repeat = repeat,

    /*
    (lang,EN:[
        extract function code whose format is (arg[,arg]) => *
        return undefined if no code is extracted
    ])
    (lang,FR:[
        extraction du code d'une fonction de la forme (arg[,arg]) => *
        retourne undefined si aucun code n'a pu être extrait
    ])
    */    

    extractCode : (f) => /^\([^\)]*\) *=>(.*)$/gms.exec(f.toString())[1],

    /*
    (lang,EN:[
        Test Driving
        ev : callback including code to test
        attemp : expected result value
        validFunc (optional) : callback validation function
        The validFunc is called only if attemp is null.
        If test passed, evaluation is repeated `Test.repeat` times for performance mesearument
    ])
    (lang,FR:[
        Fonction de pilotage des tests
        ev : callback du code a évaluer
        attempt : valeur résultat attendue 
        validFunc (optionnelle) : fonction de validation
        La fonction de validation est réalisée ssi attempt est à null
        Si le test est ok, l'évaluation est rejouée `Test.repeat` fois pour mesurer les performances
    ])
    */    
    run : (ev,attempt,validFunc=null,postPerfFunc=null) => {
        Test.count++
        var code = Test.extractCode(ev)
        console.group(code ? code : ev)
        var ok = false
        var repeat = true
        try {
            var res = ev()
        }
        catch(error) {
            var res = 'Raised an exception : "'+error+'"'
            if(typeof(attempt)==='function' && attempt.prototype.name==='Error') ok = true, repeat = false
        }
        if(validFunc!=null) {
            var vf = validFunc(res)
            if(Set.prototype.isPrototypeOf(res)) console.log([...res])
            else if(Array.prototype.isPrototypeOf(res)) console.log(res)
            else console.log(JSON.stringify(res,null,0))
            if(vf) ok = true
        }
        else if(Array.prototype.isPrototypeOf(attempt) || Set.prototype.isPrototypeOf(attempt)) {
            if(Set.prototype.isPrototypeOf(res)) {
                console.log(Object.prototype.isPrototypeOf(res[0]) ? JSON.stringify(res,null,0) : [...res])
            }
            else if(Array.prototype.isPrototypeOf(res)) {
                console.log(Object.prototype.isPrototypeOf(res[0]) ? JSON.stringify(res,null,0) : res)
            }
            else {
                console.log(Object.prototype.isPrototypeOf(res) ? JSON.stringify(res,null,0) : res)
            }
            if(Sets.areEqual(res,new Set(attempt))) ok = true
        }
        else if(res!=attempt) console.log(res)
        else console.log(Object.prototype.isPrototypeOf(res) ? JSON.stringify(res,null,0) : res), ok = true

        if(ok) {
            console.log("Test passed... ")
            if(repeat) {
                if(postPerfFunc==null) {
                    var t0 = performance.now()
                    for(var i =0;i<Test.repeat;i++) ev()
                    var t1 = performance.now()
                    console.log((t1-t0).toFixed(2)+"ms elapsed for "+Test.repeat+" executions")
                }
                else {
                    var tt = 0.0
                    for(var i =0;i<Test.repeat;i++) {
                        var t0 = performance.now()
                        ev()
                        tt += (performance.now() - t0)
                        postPerfFunc()
                    }
                    console.log((tt).toFixed(2)+"ms elapsed for "+Test.repeat+" executions")
                }
            }
            else {
                console.log("Performance analysis not run due to testing an error case")
            }
        }
        else {
            Test.failed++
            console.log("Test failed... ")
        }
        
        console.groupEnd()

    },

    /*
    (lang,EN:[
        test report
    ])
    (lang,FR:[
        compte-rendu de test
    ])
    */
    results : () => {
        console.group('****** Tests Report *******')
        console.log("tests executed : "+Test.count)
        console.log("tests passed   : "+(Test.count-Test.failed))
        console.log("tests failed   : "+Test.failed)
        console.groupEnd()
        Test.count = 0
        Test.failed = 0
    }

}