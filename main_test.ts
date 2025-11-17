import { test, expect } from "bun:test";
import { parseWhitelist } from "./src/config/env.ts";

test("parseWhitelist normalizes usernames", () => {
	const input = "Alice,  Bob ,carol,,";
	const result = parseWhitelist(input);
	expect(result).toEqual(["alice", "bob", "carol"]);
});
