"use strict";

const
	  rajs      = require('../app.js'),
	  affinity  = require('affinity'),
	  Relation  = affinity.Relation,
	  relations = createRelations();

module.exports = {
   testHelpers : function(test) {
	  test.expect(0);

	  test.done();
   },

   testJustRelation : function(test){
	  test.expect(2);

	  const
		 ra          = new rajs(),
	     results     = ra.run(relations.relationA.plain),
	     expecteds   = [['it', relations.relationA._affinity ]],
	     expectedEnv = {
		 it : relations.relationA._affinity
	  };

	  test.ok(ra._isEqualProgram(results, expecteds), "Relation assigned correctly");
	  test.ok(ra._isEqualEnv(ra.env, expectedEnv), "Environment updated correctly by Assign");
	  test.done();
   },

   testEnvInitialize : function(test){
	  test.expect(1);

	  const
		 env    = {
			it : new Relation([
					   { attr1 : { type : affinity.Integer }},
					   { attr2 : { type : affinity.Integer }}
			],[[1, 2],
			[2, 3],
			[3, 4]])
		 },
	     ra     = new rajs(env);

	  test.ok(ra._isEqualEnv(env, ra.env));
	  test.done();
   },

   testBinaryExprResults : function(test){
	  test.expect(5);

	  const
		 ra                = new rajs(getTestEnv()),
		 expectedIntersect =  relations.relationD._affinity,
		 expectedUnion     =  relations.relationA._affinity.union(relations.relationE._affinity),
		 expectedProduct   =  relations.relationA._affinity.product(relations.relationB._affinity),
		 expectedDiff      =  relations.relationD._affinity.difference(relations.relationF._affinity),
		 expectedJoin      =  relations.relationA._affinity.join(relations.relationC._affinity);
		 //expectedLeftJoin  =  relations.relationA._affinity.sjoin(relations.relationC._affinity);
		 //expectedRightJoin =  relations.relationA._affinity.join(relations.relationC._affinity);
	  
	  ra.run('resultIntersect := relationF Intersect relationD;')
	  ra.run('resultUnion := relationA Union relationE;')
	  ra.run('resultProduct := relationA X relationB;')
	  ra.run('resultDiff := relationD - relationF;')
	  ra.run('resultJoin := relationA Join relationC;')
	  //ra.run('resultLeftJoin := relationA LeftJoin relationC;')
	  //ra.run('resultRightJoin := relationA RightJoin relationC;')

	  test.ok(ra.env.resultIntersect.equal(expectedIntersect));
	  test.ok(ra.env.resultUnion.equal(expectedUnion));
	  test.ok(ra.env.resultProduct.equal(expectedProduct));
	  test.ok(ra.env.resultDiff.equal(expectedDiff));
	  test.ok(ra.env.resultJoin.equal(expectedJoin));
	  //test.ok(ra.env.resultLeftJoin.equal(expectedLeftJoin));
	  //test.ok(ra.env.resultRightJoin.equal(expectedRightJoin));
	  test.done();
   },

   testUnaryExprResults : function(test){
	  test.expect(8);
	  
	  const
		 ra                   = new rajs(getTestEnv()),
		 relationA            = relations.relationA._affinity,
		 expectedProject1     = relationA.project(['firstName']),
		 expectedProject2     = relationA.project(['firstName', 'lastName']),
		 expectedProject3     = relationA.project(['firstName','characterId', 'lastName']),
		 expectedRename       = relationA.rename({'lastName':'familyName'}),
		 characterId          = relationA.get('characterId'),
		 firstName            = relationA.get('firstName'),
		 expectedSelectSimple = relationA.restrict(characterId.equals(1)),
		 expectedSelectConjunction = relationA.restrict(characterId.equals(1).and(firstName.equals('John'))),
		 expectedSelectDisjunction = relationA.restrict(new affinity.Or(characterId.equals(1), firstName.equals('Mary'))),
		 expectedSelectNegation    = relationA.restrict(characterId.not().equals(1));

	  
	  ra.run('resultProject1     := Project[firstName](relationA);');
	  ra.run('resultProject2     := Project[firstName, lastName](relationA);');
	  ra.run('resultProject3     := Project[firstName, characterId,lastName](relationA);');
	  ra.run('resultRename       := Rename[lastName / familyName](relationA);');
	  ra.run('resultSelectSimple := Select[characterId == 1](relationA);');
	  ra.run('resultSelectConjunction := Select[characterId == 1 AND firstName == \'John\'](relationA);');
	  ra.run('resultSelectDisjunction := Select[characterId == 1 or firstName == \'Mary\'](relationA);');
	  ra.run('resultSelectNegation    := Select[NOT (characterId == 1)](relationA);');

	  test.ok(ra.env.resultProject1.equal(expectedProject1), "One attribute projection");
	  test.ok(ra.env.resultProject2.equal(expectedProject2), "Two attribute projection");
	  test.ok(ra.env.resultProject3.equal(expectedProject3), "Reordering Project");
	  test.ok(ra.env.resultRename.equal(expectedRename), "Should rename lastName to familyName");
	  test.ok(ra.env.resultSelectSimple.equal(expectedSelectSimple), "Should return one-tuple relation with 1, John, Doe");
	  test.ok(ra.env.resultSelectConjunction.equal(expectedSelectConjunction), "Should return one-tuple relation with 1, John, Doe");
	  test.ok(ra.env.resultSelectDisjunction.equal(expectedSelectDisjunction), "Should return two-tuple relation");
	  test.ok(ra.env.resultSelectNegation.equal(expectedSelectNegation), "Should return two-tuple relation");
	  test.done();
   }

};

function getTestEnv(byProgram){
   if(byProgram){
	  throw new Error("Not implemented yet");
   }

   const env = {};
   for (let key in relations){
	  env[key] = relations[key]._affinity;
   }

   return env;
}

function createRelations(){

   return {
   relationA : {
	  _affinity : new Relation([
						{characterId: { type: affinity.Integer}},
						{firstName: { type: affinity.String}},
						{lastName: { type: affinity.String}}
	  ],[
	  [1, 'John', 'Doe'],
	  [2, 'Mary', 'Poppins'],
	  [3, 'Lucky', 'Luke']
	  ]),

	  plain : "[[characterId / Integer, firstName / String, lastName / String] -> [1, 'John', 'Doe'], [2, 'Mary', 'Poppins'], [3, 'Lucky', 'Luke']];"
   },

   relationB : {
	  _affinity : new Relation([
						{product: { type: affinity.String}}
	  ],[
	  ['Doll'],
	  ['PlayMobile'],
	  ]),

	  plain : "[[product / String] -> ['Doll'],['PlayMobile']]",
   },

   relationC : {
	  _affinity : new Relation([
						{characterId: { type: affinity.Integer}},
						{fan: { type: affinity.String}}
	  ],[
	  [1, 'Mr X'],
	  [1, 'Miss Dibble'],
	  [2, 'Nat Bibble']
	  ]),
	  plain : "[[characterId / Integer, fan / String] -> [1, 'Mr X'],[1, 'Miss Dibble'],[2, 'Nat Bibble']];"
   },

   relationD : {
	  _affinity : new Relation([
						{a: { type: affinity.Integer}},
						{b: { type: affinity.Integer}},
						{c: { type: affinity.Integer}}
	  ], [
	  [1, 2, 3]
	  ]),
	  plain : "[[a / Integer, b / Integer, c / Integer] -> [1, 2, 3]];",
   },

   relationE : {
	  _affinity : new affinity.Relation([
						{characterId: { type: affinity.Integer}},
						{firstName: { type: affinity.String}},
						{lastName: { type: affinity.String}}
	  ],[
	  [1, 'Mr', 'X'],
	  [2, 'Lady', 'Gaga'],
	  [3, 'Bo', 'Vril']
	  ]),
	  plain : "[[characterId / Integer, firstName / String, lastName / String] -> [1, 'Mr', 'X'],[2, 'Lady', 'Gaga'], [3, 'Bo', 'Vril']];",
   },
   
   relationF : {
   	  _affinity : new Relation([
						{a: { type: affinity.Integer}},
						{b: { type: affinity.Integer}},
						{c: { type: affinity.Integer}}
	  ], [
	  [1, 2, 3],
	  [4, 5, 6],
	  [7, 8, 9]
	  ]),
	  plain : "[[a / Integer, b / Integer, c / Integer] -> [1, 2, 3], [4, 5, 6], [7, 8, 9]];",
   },
};
}
