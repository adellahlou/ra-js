# Ra.js

Provides a Javascript only runtime for Relational Algebra. 

Write the relational algebra syntax specified by the lastest [ra-parser](https://github.com/adellahlou/ra-parser) and see the results as an ordered program.



### How to use
```
"use strict"

const 
   rajs = require('ra-js'),
   ra   = new rajs();

ra.run("People := [[firstName / String, lastName / String] -> [['John', 'Doe'], ['Mary', 'Jane']]];");
console.log(ra.getRelation('Example');
// [[firstName / String, lastName / String] -> [['John', 'Doe']]]

ra.run("Johns := Select[firstName == 'John'](People);");
console.log(ra.env);
```


#### Ra Environment
After running relational algebra, the results are stored in the environment, referred to as the .env property.

The relations are currently available as relations from the affinity package.


TODO:
- Make output format plaintext, and fix changing state for plaintext 
- Fix support for Outer Joins
- Fix support for not equal != shorthand
- Fix support for Theta Joins
- Complete testing over operators
- Add support for grouping
- Add support for ordering
- Add support for operator functions (tangent, sine, cosine, etc.)

Please see ra-parser for the complete syntax specification. 


author: Adel Lahlou
