var recast = require('recast');

var Visitor = recast.Visitor;
var types = recast.types;
var namedTypes = types.namedTypes;
var builders = types.builders;

var identifierToLiteral = {
  "finally": true,
  "catch": true
};

var ES6Safe = Visitor.extend({
  visitProperty: function(node) {
    if (namedTypes.Identifier.check(node.key) && identifierToLiteral[node.key.name]) {
      node.key = builders.literal(node.key.name);
    }

    return this.genericVisit(node);
  },

  visitMemberExpression: function(node) {
    var property = node.property;
    var newNode;
    if (namedTypes.Identifier.check(property) && identifierToLiteral[property.name]) {
      newNode = builders.memberExpression(node.object, builders.literal(property.name), true);
    } else {
      newNode = node;
    }
    return this.genericVisit(newNode);
  }
});

module.exports.compile = function(source) {
  var ast = recast.parse(source);
  new ES6Safe().visit(ast);
  var code = recast.print(ast).code;
  return code;
};

module.exports.visit = function(ast) {
  new ES6Safe().visit(ast);
  return ast;
};