import * as semver from 'semver';
import MagicString from 'magic-string';
import parser from '@solidity-parser/parser';

export function transform(code: string) {
  const sourceUnit = parser.parse(code, { range: true });
  const pragma = sourceUnit.children.find(
    (child) => child.type === 'PragmaDirective' && child.name === 'solidity'
  ) as
    | ((typeof sourceUnit.children)[number] & { type: 'PragmaDirective' })
    | null;

  const ms = new MagicString(code);
  if (pragma) {
    if (semver.gte(semver.minVersion(pragma.value)!, '0.6.8')) {
      return code;
    }
    ms.update(pragma.range![0], pragma.range![1], 'pragma solidity >=0.6.8');
  }

  sourceUnit.children.forEach((child) => {
    if (child.type === 'ContractDefinition') {
      parser.visit(child, {
        FunctionDefinition: (node) => {
          ms.remove(node.range![0], node.range![1] + 1);
        },
      });
    }
  });

  return ms.toString();
}
