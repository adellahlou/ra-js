"use strict";

const 
   interpret = require('./interpret.js'),
   Relation  = require('affinity').Relation;

const Rajs = function(env){
   this.env = Rajs.prototype.isValidEnv(env) ? env : {};
};

// consumes input, makes changes to env
Rajs.prototype.run = function(input){
   try {
   	  // TODO: change the output to be universal, not based on affinity
	  return interpret(input, this.env);
   } catch(parseError){
	  throw parseError; 
   }
}

// handles read and deletion of relations
Rajs.prototype.getRelation = function(name){
   return this.env[name]._plainRelation;
}

Rajs.prototype.deleteRelation = function(name){
   delete this.env[name];
}

// helpers to check equality
Rajs.prototype.isRelationEqual = function(a, b){
   return a.equal(b);
}

Rajs.prototype._isEqualAssign = function(result, expected){
   return (result[0] === expected[0] && Rajs.prototype.isRelationEqual(result[1], expected[1]));
}

Rajs.prototype._isEqualProgram = function(results, expecteds){
   if(!Array.isArray(results) || !Array.isArray(expecteds)) {
	  throw new Error("Provided invalid program output");	
   }

   if(results.length !== expecteds.length){
	  return false;
   }

   return !results.some(function(result, index){
	  const expected = expecteds[index];
	  return !Rajs.prototype._isEqualAssign(result, expected);
   });
}

Rajs.prototype._isEqualEnv = function(envA, envB){
   if(!Rajs.prototype.isValidEnv(envA) || !Rajs.prototype.isValidEnv(envB)){
	  throw new Error("Provided invalid env");
   }
   
   const 
   	  envAKeys = Object.keys(envA),
	  envBkeys = Object.keys(envB);

   if(envAKeys.length != envAKeys.length){
   	  return false;
   }

   return envAKeys.every(function(key){
	  const 
	  	 relationA = envA[key],
		 relationB = envB[key];	

	  return relationA.equal(relationB);
   });
};

Rajs.prototype.isValidEnv = function(env){
   if(!(env instanceof Object)){
   	  return false;
   }

   for(let key in Object.keys(env)){
	  if(!env[key] instanceof Relation){
		 return false;
	  }
   }

   return true;
}


module.exports = Rajs;
