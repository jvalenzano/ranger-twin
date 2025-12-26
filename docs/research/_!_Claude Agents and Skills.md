

# Claude Agents and Skills

**[Katelyn Lesse – Evolving Claude APIs for Agents, Anthropic](https://youtu.be/aqW68Is_Kj4?si=ErhW5C5K-GFacLZQ)**

Good morning. So first let's give a huge thank you to Swix and the whole AI engineer organizing team for bringing us together. I'm Caitlyn and I lead the claw developer platform team at Anthropic.

So let's start with a show of hands. Who here is integrated against an LLM API to build agents? Okay, I'm talking to the right people. Love it.

So today I want to share how we're evolving our platform to help you build really powerful agentic systems using claude. So, we love working with developers who do what we call raising the ceiling of intelligence. They're always trying to be on the frontier. They're always trying to get the best out of our models and build the most high performing systems.

And so I want to walk you through how we're building a platform that helps you get the best out of Claude. And I'm going to do that using a product that you hopefully have all heard of before. It's an Agentic coding product. We love it a lot and it's called Claude Code.

So when we think about maximizing performance from our models, we think about building a platform that helps you do three things. So first, the platform helps you harness Claude's capabilities. We're training Claude to get good at a lot of stuff and we need to give you the tools in our API to use the things that Claude is actually getting good at.

Next, we help you manage Claude's context window. Keeping the right context in the window at any given time is really really critical to getting the best outcomes from Claude.

And third, we're really excited about this lately. We think you should just give Claude a computer and let it do its thing. So I'll talk about how we're evolving the platform to give you the infrastructure and otherwise that you need to actually let Claude do that.

So starting with harnessing Claude's capabilities. So we're getting Claude really good at a bunch of stuff and here are the ways that we expose that to you in our API as ideally customizable features.

So here's a first example relatively basic. Claude got good at thinking and Claude's performance on various tasks scales with the amount of time you give it to reason through those problems. And so, we expose this to you as an API feature that you can decide, do you want Claude to think longer for something more complex or do you want Claude to just give you a quick answer? We also expose this with a budget. So you can tell Claude how many tokens to essentially spend on thinking.

And so for cloud code, pretty good example. Obviously, you're often debugging pretty complex systems with cloud code or sometimes you just want a quick, answer to the thing you're trying to do. And so, Claude Code takes advantage of this feature in our API to decide whether or not to have Claude think longer.

Another basic example is tool use. Claude has gotten really good at reliably calling tools. So we expose this in our API with both our own built-in tools like our web search tool, as well as the ability to create your own custom tools. You just define a name, a description, and an input schema. And Claude is pretty good at reliably knowing when to actually go and call those tools and pass the right arguments.

So, this is relevant for cloud code. Cloud code has many, many, many tools and it's calling them all the time to do things like read files, search for files, write to files, and do stuff like rerun tests and otherwise.

So, the next way we're evolving the platform to help you ma maximize intelligence from claude is helping you manage Claude's context window. Getting the right context at the right time in the window is one of the most important things that you can do to maximize performance. But context management is really complex to get right. Especially for a coding agent like Claude Code. You've got your technical designs, you've got your entire codebase. You've got instructions, you've got tool calls. All these things might be in the window at any given time. And so how do you make sure the right set of those things are in the window? So getting that context right and keeping it optimized over time is something that we've thought a lot about.

So let's start with MCP model context protocol. We introduced this a year ago and it's been really cool to see the community swarm around adopting MCP as a standardized way for agents to interact with external systems. And so for cloud code, you might imagine GitHub or Century. there are plenty of places kind of outside of the agent's context where there might be additional information or tools or otherwise that you want your agent to be able to interact with or the cloud code agent to be able to interact with. And so this will obviously get you much better performance than an agent that only sees the things that are in its window as a result of your prompting.

So the next thing is memory. So, if you can use tools like MCP to get context into your window, we introduced a memory tool to help you actually keep context outside of the window that Claude knows how to pull back into the window only when it actually needs it. And so we introduced the first iteration of our memory tool as essentially a clientside file system. So, you control your data, but Claude is good at knowing, oh, this is like a good thing that I should store away for later. And then, it knows when to pull that context back in.

So for cloud code, you could imagine your patterns for your codebase or maybe your preferences for your git workflows. These are all things that claude can store away in memory and pull back in only when they're actually relevant.

And so the third thing is context editing. If memory helps you keep stuff outside the window and pull it back in when it makes sense, context editing helps you clear stuff out that's not relevant right now and shouldn't be in the window. So our first iteration of our context editing is just clearing out old tool results. And we did this because tool results can actually just be really large and take up a lot of space in the window. And we found that tool results from past calls are not necessarily super relevant to help claude get good responses later on in a session.

And so you can think about for cloud code, cloud code is calling hundreds of tools. Those files that it read otherwise, all these things are taking up space within the window. So they take advantage of context management to clear those things out of the window.

And so we found that if we combined our memory tool with context editing, we saw a 39% bump in performance over o over the benchmark on our own internal evals. Which was really really huge. And so it just kind of shows you the importance of keeping things in the window that are only relevant at any given time.

And we're expanding on this by giving you larger context windows. So for some of our models, you can have a million token context window. Combining that larger window with the tools to actually edit what's in your window maximizes your performance. And over time we're teaching Claude to get better and better at actually understanding what's in its context window. So maybe it has a lot of room to run, maybe it's almost out of space. And Claude will respond accordingly depending on how much time or how much room it has left in the window.

So, here's the third thing. We think you should give Claude a computer and just let it do its thing. We're really excited about this one. Because there's a lot of discourse right now around agent harnesses. You know, how much scaffolding should you have? How opinionated should it be? Should it be heavy? Should it be light? And I think at the end of the day, Claude has access to writing code. And if Claude has access to running that same code, it can accomplish anything. you can get really great professional outputs for the things that you're doing just by giving Claude runway to go and do that.

But the challenge for letting you do that is actually the infrastructure as well as stuff like expertise like how do you give cloud access to things that when it's using a computer it will get you better results.

So a fun story is we recently launched cloud code on web and mobile. And this was a fun project for our team because we had a lot of problems to solve. When you're running cloud code locally, cloud code is essentially using your machine as its computer. But if you're starting a session on the web or on mobile and then you're walking away, what's happening? Like where is that where is cloud code running? Where is it doing its work?

And so we had some hard problems to solve. We needed a secure environment for cloud to be able to write and run code that's not necessarily like approved code by you. We needed to solve or container orchestration at scale. And we needed session persistence because we launched this and many of you were excited about it and started many many sessions and walked away and we had to make sure that all of these things were ready to go when you came back and wanted to see the results of what Claude did.

So one key primitive in this is our code execution tool. So we released our code execution tool in the API which allows Claude to run write code and run that code in a secure sandboxed environment. So our platform handles containers, it handles security, and you don't have to think about these things because they're running on our servers.

So you can imagine deciding that you want Claude to write some code and you want Claude to go and be able to run that code. And for cloud code, there's plenty of examples here. Like make an animation more sparkly that you want Claude to actually be able to run that code.

So we really think the future of agents is letting the model work pretty autonomously within a sandbox environment and we're giving you the infrastructure to be able to do that.

And this gets really powerful once you think about giving the model actual domain expertise in the things that you're trying to do. So we recently released agent skills which you can use in combination with our code execution tool. Skills are basically just folders of scripts, instructions, and resources that Claude has access to and can decide to run within its sandbox environment.

It decides to do that based on the request that you gave it as well as the description of a skill. And Claude is really good at knowing like this is the right time to pull this skill into context and go ahead and use it.

And you can combine skills with tools like MCP. So MCP gives you access to tools and access to context. And then skills give you the expertise to actually make use of those tools and make use of that context.

And so for cloud code, a good example is web design. Maybe whenever you launch a new product or a new feature, you build landing pages. And when you build those landing pages, you want them to follow your design system and you want them to follow the patterns that you've set out. And so Claude will know, okay, I'm being told to build a landing page. This is a good time to pull in the web design skill. and use the right patterns and and design system for that landing page.

Tomorrow Barry and Mahes from our team are giving a talk on skills. They'll go much deeper and I definitely recommend checking that out.

So these are the ways that we're evolving our platform to help you take advantage of everything that Claude can do to get the absolute best performance for the things that you're building. First, harnessing Claude's capabilities. So, as our research team trains Claude, we give you the API features to take advantage of those things. Next, managing Claude's context, it's really, really important to keep your context window clean with the right context at the right time. And third, giving Claude a computer and just letting it do its thing.

So, we're going to keep evolving our platform. As Claude gets better and has more capabilities and gets better at the capabilities it already has, we'll continue to evolve the API around that so that you can stay on the frontier and take advantage of the best that Claude has to offer.

Second, as memory and context evolve, we're going to up the ante on the tools that we give you in order to let Claude decide what to pull in, what to store away for later, and what to clean out of the context window.

And third, we're really going to keep leaning into agent infrastructure. Some of the biggest problems with the idea of just let Claude have a computer and do its thing are those problems that I talked about around orchestration, secure environments, and sandboxing. And so we're going to keep working to make sure that those are ready for you to take advantage of.

And I'm hiring. We're hiring at Anthropic. We're really growing our team. And so if you're someone who loves building delightful developer products and if you're excited about what we're doing with Claude, we would love to work with you across end product design, Devril, lots of functions. So please reach out to us and thank you.

---

**[Don't Build Agents, Build Skills Instead – Barry Zhang & Mahesh Murag, Anthropic](https://youtu.be/CEvIs9y1uog?si=v3BMSE_aRtbhWSUx)**

All right, good morning and thank you for having us again. Last time we were here, we're still figuring out what an agent even is. Today, many of us are using agents on a daily basis. But we still notice gaps. We still have slots, right? Agents have intelligence and capabilities, but not always expertise that we need for real work. I'm Barry. This is Mahes. We created agent skills. In this talk, we'll show you why we stopped building agents and started building skills instead.

A lot of things have changed since our last talk. MCP became the standard for agent connectivity. Cloud Code, our first coding agent, launched to the world and our cloud agent SDK now provides a production ready agent out of the box. We have a more mature ecosystem and we're moving towards a new paradigm for agents. That paradigm is a tighter coupling between the model and a runtime environment. Put simply, we think code is all we need.

We used to think agents in different domains will look very different. Each one will need its own tools and scaffolding and that means we'll have a separate agent for each use case for each domain. Well, customization is still important for each domain. The agent underneath is actually more universal than we thought. What we realized is that code is not just a use case but the universal interface to the digital world.

After we built cloud code, we realized that cloud code is actually a general purpose agent. Think about generating a financial report. The model can call the API to pull in data and do research. It can organize that data in the file system. It can analyze it with Python and then synthesize the insight in old file format all through code. The core scaffolding can suddenly become as thin as just bash and file system which is great and really scalable. But we very quickly run into a different problem and that problem is domain expertise.

Who do you want doing your taxes? Is it going to be Mahesh, the 300 IQ mathematical genius, or is it Barry, an experienced tax professional, right? I would pick Barry every time. I don't want Mahesh to figure out the 2025 tax code from first principles. I need consistent execution from from a domain expert.

As agents today are a lot like Mahes. They're brilliant, but they lack expertise. They can do no more slow. They can do amazing things when you really put in the effort and give proper guidance, but they're often missing the important context up front. They can't really absorb your expertise super well, and they don't learn over time.

That's why we created agent skills. Skills are organized collections of files that package composable procedural knowledge for agents. In other words, they're folders. This simplicity is deliberate. We want something that anyone human or agent can create and use as long as they have a computer. These also work with what you already have. You can version them in Git, you can throw them in Google Drive and you can zip them up and share with your team. We have used files for uh as a primitive for decades and we like them. So why change now?

Because of that skills can also include a lot of scripts as tools. Traditional tools have pretty obvious problems. Some tools have poorly written instructions and are pretty ambiguous and when the model is struggling, it can't really make a change to the tool. So, it's just kind of stuck with a code start problem and they always live in the context window. Code solves some of these issues. It's self-documenting. It is modifiable and can live in the file system until they're really needed and used.

Here's an example of a script inside of a skill. We kept seeing Claude write the same Python script over and over again to apply styling to slides. So we just ask cloud to save it inside of the skill as a tool for his version for his future self. Now we can just run the script and that makes everything a lot more consistent and a lot more efficient.

At this point skills can contain a lot of information and we want to protect the context window so that we can fit in hundreds of skills and make them truly composable. That's why skills are progressively disclosed. At runtime, only this metadata is shown to the model just to indicate that he has the skill. When an agent needs to use a skill, it can read in the rest of the skill.md, which contains the core instruction and directory for the rest of the folder. Everything else is just organized for ease of access.

So that's all skills are. They're organized folders with scripts as tools. Since our launch five weeks ago, this very simple design has translated into a very quickly growing ecosystem of thousands of skills. And we've seen this be split across a couple of different types of skills. There are foundational skills, third party skills created by partners in the ecosystem, and skills built within an enterprise and within teams.

To start, foundational skills are those that give agents new general capabilities or domain specific capabilities that it didn't have before. We ourselves with our launch built document skills that give Claude the ability to create and edit professional quality office documents. We're also really excited to see people like Cadence build scientific research skills that give Claude new capabilities like EHR data analysis and using common Python bioinformatics libraries better than it could before.

We've also seen partners in the ecosystem build skills that help Claude better with their own software and their own products. Browserbase is a pretty good example of this. They built a skill for their open- source browser automation tooling, stage hand. And now Claude equipped that this skill and with stage hand can now go navigate the web and use a browser more effectively to get work done. And notion launched a bunch of skills that help claude better understand your notion workspace and do deep research over your entire workspace.

And I think where I've seen the most excitement and traction with skills is within large enterprises. These are company and team specific skills built for an organization. We've been talking to Fortune 100s that are using skills as a way to teach agents about their organizational best practices and the weird and unique ways that they use this bespoke internal software. We're also talking to really large developer productivity teams. These are teams serving thousands or even tens of thousands of developers in an organization that are using skills as a way to deploy agents like cloud code and teach them about code style best practices and other ways that they want their developers to work internally.

So all of these different types of skills are created and consumed by different people inside of an organization or in the world. But what they have in common is anyone can create them and they give agents the new capabilities that they didn't have before.

So, as this ecosystem has grown, we've started to observe a couple of interesting trends. First, skills are starting to get more complex. The most basic skill today can still be a skill.md markdown file with some prompts and some really basic instructions, but we're starting to see skills that package software, executables, binaries, files, code, scripts, assets, and a lot more. And a lot of the skills that are being built today might take minutes or hours to build and put into an agent. But we think that increasingly much like a lot of the software we use today, these skills might take weeks or months to build and be maintained.

We're also seeing that this ecosystem of skills is complementing the existing ecosystem of MCP servers that was built up over the course of this year. Developers are using and building skills that orchestrate workflows of multiple MCP tools stitched together to do more complex things with external data and connectivity. And in these cases, MCP MCP is providing the connection to the outside world while skills are providing the expertise.

And finally, and I think most excitingly for me personally, is we're seeing skills that are being built by people that aren't technical. These are people in functions like finance, recruiting, accounting, legal, and a lot more. Um, and I think this is pretty early validation of our initial idea that skills help people that aren't doing coding work extend these general agents and they make these agents more accessible for the day-to-day of what these people are working on.

So tying this all together, let's talk about how these all fit into this emerging architecture of general agents. First, we think this architecture is converging on a couple of things. The first is this agent loop that helps manage the the model's internal context and manages what tokens are going in and out. And this is coupled with a runtime environment that provides the agent with a file system and the ability to read and write code. This agent, as many of us have done throughout this year, can be connected to MCP servers. And these are tools and data from the outside world that make the the agent more relevant and more effective. And now we can give the same agent a library of hundreds or thousands of skills that it can decide to pull into context only at runtime when it's deciding to work on a particular task.

Today, giving an agent a new capability in a new domain might just involve equipping it with the right set of MCP servers and the right library of skills. And this emerging pattern of an agent with an MCP server and a set of skills is something that's already helping us at Enthropic deploy Claude to new verticals. Just after we launched skills 5 weeks ago, we immediately launched new offerings in financial services and life sciences. And each of these came with a set of MCP servers and a set of skills that immediately make Claude more effective for professionals in each of these domains.

We're also starting to think about some of the other open questions and areas that we want to focus on for how skills evolve in the future as they start to become more complex. We really want to support developers, enterprises, and other skill builders by starting to treat skills like we treat software. This means exploring testing and evaluation, better tooling to make sure that these agents are loading and triggering skills at the right time and for the right task, and tooling to help measure the output quality of an agent equipped with the skill to make sure that's on par with what the agent is supposed to be doing.

We'd also like to focus on versioning. as a skill evolves and the resulting agent behavior uh evolves, we want this to be uh clearly tracked and to have a clear lineage over time. And finally, we'd also like to explore skills that can explicitly depend on and refer to either other skills, MCP servers, and dependencies and packages within the agents environment. We think that this is going to make agents a lot more predictable in different runtime environments. and the composability of multiple skills together will help agents like Claude elicit even more complex and relevant behavior from these agents. Overall, these set of things should hopefully make skills easier to build and easier to integrate into agent products, even those besides claude.

Finally, a huge part of the value of skills we think is going to come from sharing and distribution. Barry and I think a lot about the future of companies that are deploying these agents at scale. And the vision that excites us most is one of a collecting and collective and evolving knowledge base of capabilities that's curated by people and agents inside of an organization. We think skills are a big step towards this vision. They provide the procedural knowledge for your agents to do useful things. And as you interact with an agent and give it feedback and more institutional knowledge, it starts to get better and all of the agents inside your team and your org get better as well. And when someone joins your team and starts using Claude for the first time, it already knows what your team cares about. It knows about your day-to-day and it knows about how to be most effective for the work that you're doing.

And as this grows and this ecosystem starts to develop even more, this was going to this compounding value is going to extend outside of just your organ into the broader community. So just like when someone else across the world builds an MCP server that makes your agent more useful, a skill built by someone else in the community will help make your own agents more capable, reliable, and useful as well.

This vision of a evolving knowledge base gets even more powerful when claw starts to create these skills. We design skills specifically as a concrete steps towards uh continuous learning. When you first start using cloud, this standardized format gives a very important guarantee. Anything that cloud writes down can be used efficiently by a future version of itself. This makes the learning actually transferable. As you build up the context skills makes the concept of memory more tangible. They don't capture everything. They don't capture every type of information. Just procedural knowledge that cloud can use on specific tasks.

When you have worked with cloud for quite a while, the flexibility of skills matters even more. Cloud can acquire new capabilities instantly, evolve them as needed, and then drop the ones that become obsolete. This is what we have always known. The power of in in context learning makes this a lot more cost-effective for information that change on daily basis. Our goal is that claude on day 30 of working with you is going to be a lot better on cloud on day one. CL can already create skills for you today using our skill creator skill and we're going to continue pushing in that direction.

We're going to conclude by comparing the agent stack to what we have already seen computing. In a rough analogy, models are like processors. Both require massive investment and contain immense potential, but only so useful by themselves. Then we start building operating system. The OS made processors far more valuable by orchestrating the processes, resources, and data around the processor. In AI, we believe that agent runtime is starting to play this role. We're all trying to build the cleanest, most efficient, and most scalable uh abstractions to get the right tokens in and out of the model.

But once we have a platform, the real value comes from applications. A few companies build uh processors and operating systems, but millions of developers like us have built software that encoded domain expertise and our unique points of view. We hope that skills can help us open up this layer for everyone. This is where we get creative and solve concrete problem for ourselves, for each other, and for the world just by putting stuff in the folder.

So skills are just the starting point. To close out, we think we're now converging on this general architecture for general agents. We've created skills as a new paradigm for shipping and sharing new capabilities. So we think it's time to stop rebuilding agents and start building skills instead. And if you're excited about this, come work with us and start building some skills today. Thank you. 

---

