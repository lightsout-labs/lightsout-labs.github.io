import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

interface Field {
  type: string;
  id?: string;
  attributes: { label: string };
  validations?: { required?: boolean };
}

describe("the content revision issue template", () => {
  const template = parse(readFileSync(".github/ISSUE_TEMPLATE/content-revision.yml", "utf8")) as {
    name: string;
    body: Field[];
  };

  it("is named Content revision", () => {
    expect(template.name).toBe("Content revision");
  });

  it("requires the article or post, the language, and the change wanted", () => {
    const required = template.body
      .filter((field) => field.validations?.required)
      .map((field) => field.id);
    expect(required).toEqual(["piece", "language", "change"]);
  });
});
