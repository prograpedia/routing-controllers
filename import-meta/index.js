"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(program, pluginConfig, _a) {
    var tsInstance = _a.ts;
    return function (ctx) {
        var factory = ctx.factory;
        return function (sourceFile) {
            if (ctx.getCompilerOptions().module !== tsInstance.ModuleKind.CommonJS)
                return sourceFile;
            var _a = createImportMeta(tsInstance, factory), meta = _a[0], dec = _a[1];
            function visitor(node) {
                if (isImportMeta(node, tsInstance))
                    return meta;
                return tsInstance.visitEachChild(node, visitor, ctx);
            }
            sourceFile = tsInstance.visitEachChild(sourceFile, visitor, ctx);
            sourceFile = factory.updateSourceFile(sourceFile, [dec, nullPrototype(meta, factory)].concat(sourceFile.statements), sourceFile.isDeclarationFile, sourceFile.referencedFiles, sourceFile.typeReferenceDirectives, sourceFile.hasNoDefaultLib, sourceFile.libReferenceDirectives);
            // console.log(sourceFile);
            return sourceFile;
        };
    };
}
// const __meta = { url: require('url').pathToFileURL(__filename).href }
function createImportMeta(tsInstance, factory) {
    var identifier = factory.createIdentifier('__meta');
    var urlModule = factory.createCallExpression(factory.createIdentifier('require'), undefined, [factory.createStringLiteral('url')]);
    var pathToFileURL = factory.createPropertyAccessExpression(urlModule, factory.createIdentifier('pathToFileURL'));
    var normalizedFileName = factory.createPropertyAccessExpression(factory.createCallExpression(pathToFileURL, undefined, [factory.createIdentifier('__filename')]), factory.createIdentifier('href'));
    var metaObjectLiteral = factory.createObjectLiteralExpression([factory.createPropertyAssignment(factory.createIdentifier('url'), normalizedFileName)], false);
    var importMeta = factory.createVariableStatement(undefined, factory.createVariableDeclarationList([factory.createVariableDeclaration(identifier, undefined, undefined, metaObjectLiteral)], tsInstance.NodeFlags.Const));
    return [identifier, importMeta];
}
function nullPrototype(node, factory) {
    return factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('Object'), factory.createIdentifier('setPrototypeOf')), undefined, [node, factory.createNull()]));
}
function isImportMeta(node, tsInstance) {
    return tsInstance.isMetaProperty(node) && node.keywordToken === tsInstance.SyntaxKind.ImportKeyword && node.name.text === 'meta';
}
