> **Software in the era of AI**
> [Video Link](https://www.youtube.com/watch?v=LCEmiRjPEtQ)
# The Software Timeline
* Software 1.0 - Code (It programs computer)
* Software 2.0 - Weights (It programs neural network)
* Software 3.0 - Prompts (It programs LLM. LLM = programmable neural network)

# Part 1 - How to think about LLMs
> AI is the new Electricity - Andrew Ng

- LLMs have the properties of utilities .. (Similar to Electricity)
- LLMs have the properties of fabs ..
- LLMs have the properties of Operating Systems ..
![[LLM Talk - Andrej 1.png]]
![[LLM Talk - Andrej 2.png]]
![[LLM Talk - Andrej 3.png]]

# Part 2 - LLM Psychology
- Encyclopedic knowledge/ memory
- Hallucinations 
- Jagged Hallucinations (9.11 > 9.9; 2 r's in "Strawberry")
- Anterograde Amnesia (Context windows ~= working memory; No continual learning, no equivalent of "sleep" to consolidate knowledge, insight or expertise into weights)
- Gullibility (Prompt inject risks, e.g. of private data)

# Part 3 - Opportunities
## Partial Autonomy apps
> "Copilot" / "Cursor for X"

**Examples :**
- Anatomy of Cursor
	1. Package state into a context widow before calling LLM
	2. Orchestrate and call multiple models (e.g. embedding models, chat models ..) 
	3. Application-specific GUI (The green and red section in code denoting the new additions and deletions of code by the Agent/ AI)
	4. Autonomy slider: Tab -> Cmd+K -> Cmd+L -> Cmd+I (agent mode)
- Anatomy of Perplexity (Similar to Cursor)
- **Keeping AI on the Leash (AI-assisted coding workflows - very rapidly evolving):**
	1. Describe the single, next concrete, incremental change
	2. don't ask for code, ask for approaches
		1. Pick an approach, draft code
		2. review/learn; pull up API docs, ask for explanations ..
		3. wind back, try a different approach
	3. test
	4. git commit
	5. ask for suggestion on what could be implemented next
	6. repeat

# Build for Agents 🤖
While developing a new software / application, the coding part is the easiest, the following aspects are still browser click things that needs to be manually done by us:
- LLM API Keys
- Vercel deployments
- Domain Names
- Authentication
- Payments
> [!info] I personally felt this during the deployment of my 'FinSight' app online

There is a new category of consumer/manipulator of digital information:
1. Humans (GUIs)
2. Computers (APIs)
3. **NEW:** Agents <- computers.. but human-like

**Agent based migration :**
1. Make documentations markdown based (Vercel and few others are migrating their entire documentations to markdown which is best for LLMs to read and understand)
2. Vercel have also started to include the **curl** commands in place where an **Action - browser click** was previously present
3. **MCP (Model Context Protocol) :** Protocol speaking directly to agents
