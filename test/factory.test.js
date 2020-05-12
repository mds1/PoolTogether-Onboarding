const { accounts, contract } = require("@openzeppelin/test-environment");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Factory = contract.fromArtifact("Factory");

describe("Factory", () => {
  const [owner] = accounts;

  before(async () => {
    this.instance = await Factory.new({ from: owner });
  });

  it("should see the deployed factory contract", async () => {
    expect(this.instance.address.startsWith("0x")).to.be.true;
    expect(this.instance.address.length).to.equal(42);
  });
});
