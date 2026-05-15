import {
  matchesPattern,
  anyFileMatchesPattern,
  anyFileMatchesAnyPattern,
  filterFilesByPatterns,
  patternToRegex,
} from "./path-filter";

describe("patternToRegex", () => {
  it("converts a simple wildcard", () => {
    expect(patternToRegex("src/*.ts")).toBe("src/[^/]*\\.ts");
  });

  it("converts a double-star wildcard", () => {
    expect(patternToRegex("src/**/*.ts")).toBe("src/.*[^/]*\\.ts");
  });

  it("escapes special regex characters", () => {
    expect(patternToRegex("src/foo.ts")).toBe("src/foo\\.ts");
  });
});

describe("matchesPattern", () => {
  it("matches a simple glob", () => {
    expect(matchesPattern("src/index.ts", "src/*.ts")).toBe(true);
  });

  it("does not match a file in a subdirectory with single star", () => {
    expect(matchesPattern("src/utils/helper.ts", "src/*.ts")).toBe(false);
  });

  it("matches nested paths with double star", () => {
    expect(matchesPattern("src/utils/helper.ts", "src/**/*.ts")).toBe(true);
  });

  it("matches exact file names", () => {
    expect(matchesPattern("package.json", "package.json")).toBe(true);
  });

  it("does not match unrelated files", () => {
    expect(matchesPattern("README.md", "src/**/*.ts")).toBe(false);
  });
});

describe("anyFileMatchesPattern", () => {
  it("returns true when at least one file matches", () => {
    expect(anyFileMatchesPattern(["src/a.ts", "docs/readme.md"], "src/*.ts")).toBe(true);
  });

  it("returns false when no files match", () => {
    expect(anyFileMatchesPattern(["docs/readme.md"], "src/*.ts")).toBe(false);
  });
});

describe("anyFileMatchesAnyPattern", () => {
  it("returns true when a file matches one of the patterns", () => {
    expect(
      anyFileMatchesAnyPattern(["src/index.ts"], ["docs/**", "src/*.ts"])
    ).toBe(true);
  });
});

describe("filterFilesByPatterns", () => {
  it("returns only files that match at least one pattern", () => {
    const files = ["src/a.ts", "docs/guide.md", "src/b.ts"];
    expect(filterFilesByPatterns(files, ["src/*.ts"])).toEqual(["src/a.ts", "src/b.ts"]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterFilesByPatterns(["docs/guide.md"], ["src/*.ts"])).toEqual([]);
  });
});
