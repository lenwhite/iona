import type { PrismaClient } from "@prisma/client";

const DEFAULT_CONTEXT_LIMIT = 3;

export async function gatherContext(
	prisma: PrismaClient,
	_query: string,
	limit = DEFAULT_CONTEXT_LIMIT,
): Promise<string> {
	const docs = await prisma.knowledgeDocument.findMany({
		orderBy: { updatedAt: "desc" },
		take: limit,
	});

	if (!docs.length) {
		return "";
	}

	return docs.map((doc) => `Title: ${doc.title}\n${doc.content}`).join("\n\n");
}
