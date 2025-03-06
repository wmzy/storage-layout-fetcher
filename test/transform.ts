import { transform } from '../src/transform';

describe('transform', () => {
  it('should update pragma to >=0.6.8 if version is less', () => {
    const code = 'pragma solidity ^0.5.0;';
    const result = transform(code);
    expect(result).to.equal('pragma solidity >=0.6.8;');
  });

  it('should not update pragma if version is >=0.6.8', () => {
    const code = 'pragma solidity ^0.6.8;';
    const result = transform(code);
    expect(result).to.equal(code);
  });

  it('should remove function definitions inside structs', () => {
    const code = `contract MyContract {function doSomething() public {}}`;
    const result = transform(code);
    expect(result).equal('contract MyContract {}');
  });

  it('should not alter code without structs', () => {
    const code = 'pragma solidity ^0.6.8; contract MyContract {}';
    const result = transform(code);
    expect(result).to.equal(code);
  });
});
