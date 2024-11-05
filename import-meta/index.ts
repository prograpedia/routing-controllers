import ts from 'typescript';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

export default function (program: ts.Program, pluginConfig: PluginConfig, { ts: tsInstance }: TransformerExtras) {
  return (ctx: ts.TransformationContext) => {
    const {factory} = ctx;
    return (sourceFile: ts.SourceFile) => {
      if (ctx.getCompilerOptions().module !== tsInstance.ModuleKind.CommonJS) return sourceFile
      const [meta, dec] = createImportMeta(tsInstance, factory)

      function visitor(node: ts.Node): ts.Node {
        if (isImportMeta(node, tsInstance)) return meta
        return tsInstance.visitEachChild(node, visitor, ctx)
      }
      sourceFile = tsInstance.visitEachChild(sourceFile, visitor, ctx)
      sourceFile = factory.updateSourceFile(
        sourceFile,
        ([dec, nullPrototype(meta, factory)] as ts.Statement[]).concat(sourceFile.statements),
        sourceFile.isDeclarationFile,
        sourceFile.referencedFiles,
        sourceFile.typeReferenceDirectives,
        sourceFile.hasNoDefaultLib,
        sourceFile.libReferenceDirectives
      )
      // console.log(sourceFile);
      return sourceFile
    }
  }
}
// const __meta = { url: require('url').pathToFileURL(__filename).href }
function createImportMeta(tsInstance: typeof ts, factory: ts.NodeFactory) {
  const identifier = factory.createIdentifier('__meta')
  const urlModule = factory.createCallExpression(factory.createIdentifier('require'), undefined, [factory.createStringLiteral('url')])
  const pathToFileURL = factory.createPropertyAccessExpression(urlModule, factory.createIdentifier('pathToFileURL'))
  const normalizedFileName = factory.createPropertyAccessExpression(
    factory.createCallExpression(pathToFileURL, undefined, [factory.createIdentifier('__filename')]),
    factory.createIdentifier('href')
  )
  const metaObjectLiteral = factory.createObjectLiteralExpression(
    [factory.createPropertyAssignment(factory.createIdentifier('url'), normalizedFileName)],
    false
  )
  const importMeta = factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(identifier, undefined, undefined, metaObjectLiteral)],
      tsInstance.NodeFlags.Const
    )
  )
  return [identifier, importMeta] as const
}
function nullPrototype(node: ts.Identifier, factory: ts.NodeFactory) {
  return factory.createExpressionStatement(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(factory.createIdentifier('Object'), factory.createIdentifier('setPrototypeOf')),
      undefined,
      [node, factory.createNull()]
    )
  )
}
function isImportMeta(node: ts.Node, tsInstance: typeof ts): node is ts.MetaProperty {
  return tsInstance.isMetaProperty(node) && node.keywordToken === tsInstance.SyntaxKind.ImportKeyword && node.name.text === 'meta'
}
