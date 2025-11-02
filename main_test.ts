import { assertEquals } from "@std/assert";
import { parseWhitelist } from "./src/config/env.ts";

Deno.test("parseWhitelist normalizes usernames", () => {
  const input = "Alice,  Bob ,carol,,";
  const result = parseWhitelist(input);
  assertEquals(result, ["alice", "bob", "carol"]);
});
