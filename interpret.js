"use strict";

const 
   parser        = require('ra-parser'),
   affinity      = require('affinity'),
   affinityTypes = {
	  INTEGER : affinity.Integer,
	  STRING  : affinity.String,
	  DATE    : affinity.Date,
	  BOOLEAN : affinity.Boolean
   },
   makeAffinityAttribute = function(attribute) {
	  const 
		 attributeType = affinityTypes[attribute.valueType.toUpperCase()],
		 relationAttribute = {};

	  if(attributeType) {
		 relationAttribute[attribute.name] = { type : attributeType};
		 return relationAttribute;
	  }

	  throw new Error("Invalid attribute " + attribute.name + 
			" type provided: " + attribute.valueType);
   },
   opToFunction = {
	  "=="  : "Equal",
	  ">"   : "GreaterThan",
	  ">="  : "GreaterThanEqual",
	  "<"   : "SmallerThan",
	  "<="  : "SmallerThanEqual",
	  "AND" : "And",
	  "NOT" : "Not",
	  "OR"  : "Or"
   },
   mapOp     = function(op){
	  return affinity[opToFunction[op.toUpperCase()]];
   },
   interpretConditionList = function(conditionList, relation){
	  const rawOp = conditionList.op;
	  const op = mapOp(rawOp);

	  if(!op) {
		 throw new Error("Received invalid op: " + conditionList.op);
	  }

	  if(rawOp == 'AND' || rawOp == 'OR'){
		 return new op(
		 	   interpretConditionList(
				  conditionList.left,
				  relation
				  ), 
			   interpretConditionList(
			   	  conditionList.right,
			   	  relation
				  )
		 );
	  } else if (rawOp == 'NOT'){
		 return new op(interpretConditionList(conditionList.left, relation))
	  } else {
	  	 let left, right;

		 if(typeof conditionList.left == 'string'){
			left = relation.get(conditionList.left);    
		 } else {
			left = conditionList.left;
		 }
		 
		 //TODO: make difference between id and string
		 right = conditionList.right;
		 return new op(left, right);
	  }
   };

module.exports = function(input, env){
   const ast = parser.parse(input);
   return interpret(ast, env);
}

function interpret(node, env){
   if(!(node instanceof Object) || node instanceof Date){
	  return node;
   };

   if(!node.type || typeof node.type != 'string'){
	  throw new Error('Received object without a valid node type');
   }

   let left, right, op, results;

   switch(node.type.toUpperCase()){
	  case "PROGRAM":
		 results = [];
		 node.body.forEach(function(statement) {
			results.push(interpret(statement, env));
		 });

		 return results;
		 break;
	  case "ASSIGN":
		 env[node.id] = interpret(node.value, env);
		 return [node.id, env[node.id]];
		 break;
	  case "INTERSECT":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.intersect(right);
		 break;
	  case "UNION":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.union(right);
		 break;
	  case "DIFFERENCE":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.difference(right);
		 break;
	  case "PRODUCT":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.product(right);
		 break;
	  case "DIVIDE":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.compose(right);
		 break;
	  case "NATURALJOIN":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.join(right);
		 break;
	  case "THETAJOIN":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.difference(right);
		 break;
	  case "LEFTJOIN":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.sjoin(right);
		 break;
	  case "RIGHTJOIN":
		 left  = interpret(node.left, env);
		 right = interpret(node.right, env);

		 return left.sdifference(right);
		 break;
	  case "PROJECT":
		 left = interpret(node.relation, env);
		 return left.project(node.attributeList);
		 break;
	  case "RENAME":
		 left = {};  
		 left[node.target] = node.newName;
		 return interpret(node.relation, env).rename(left);
		 break;
	  case "SELECT":
		 right = interpret(node.relation, env);
		 left  = interpretConditionList(node.conditionList, right);
		 
		 return right.restrict(left);
		 break;
	  		 break;
	  case "RELATIONREFERENCE":
		 if(env[node.name]){ 
			return env[node.name] 
		 } 

		 throw new Error("Referenced relation doesn't exist: " + node.name);
		 break;
	  case "RELATION":
		 left = node.attributes.map(makeAffinityAttribute);
		 right =  new affinity.Relation(left, node.data);
		 right._plainRelation = node;
		 return right;
		 break;
	  default:
		 throw new Error("Unrecognized node type: " + node.type);
   };
};
