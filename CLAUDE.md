# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Color Pulse Media** is a B2B landing page project showcasing a digital media network and services. The project is being developed using the BMAD (Build Modern Apps Differently) methodology, which is a structured workflow-based approach to software development.

### Project Details
- **Type**: Single-page B2B landing page
- **Tech Stack**: Next.js, Tailwind CSS, Strapi CMS
- **Languages**: French + English (i18n)
- **Animations**: GSAP or CSS/IntersectionObserver
- **Design Reference**: diginov.io (airy blocks, massive typography, short impactful phrases)

### Services to Present
1. Online Press
2. Content Production
3. Training
4. Consulting

## BMAD Workflow System

This project uses BMAD, which provides structured workflows for each phase of development. The system is installed in `_bmad/` and integrated with Cursor rules in `.cursor/rules/bmad/`.

### Key BMAD Concepts

**Workflow Phases:**
1. **Analysis** - Product briefs, research
2. **Planning** - PRDs, UX design
3. **Solutioning** - Architecture, epics & stories
4. **Implementation** - Development, testing, review

**Output Locations:**
- Implementation artifacts: `_bmad-output/implementation-artifacts/`
- Project documentation: Generated during workflows in `_bmad-output/`

### Available Workflows

To invoke BMAD workflows in Cursor, reference them as: `@bmad/bmm/workflows/{workflow-name}`

**Key workflows you'll use:**
- `workflow-status` - Check current project phase and next steps
- `workflow-init` - Initialize a new BMM project workflow
- `create-prd` - Create product requirements document
- `create-architecture` - Define technical architecture
- `create-epics-and-stories` - Break down requirements into implementation tasks
- `create-tech-spec` - Create detailed technical specifications
- `dev-story` - Execute a user story
- `code-review` - Perform adversarial code review
- `quick-dev` - Flexible development workflow

**Available agents:**
- `@bmad/bmm/agents/pm` - Product Manager persona
- `@bmad/bmm/agents/architect` - Technical Architect persona
- `@bmad/bmm/agents/dev` - Developer persona
- `@bmad/bmm/agents/ux-designer` - UX Designer persona
- `@bmad/bmm/agents/analyst` - Business Analyst persona

### Working with BMAD in Claude Code

When using Claude Code with this project:

1. **Check Project Status**: Use the workflow-status workflow to understand current phase
2. **Follow Phase Order**: Complete Analysis → Planning → Solutioning → Implementation
3. **Review Artifacts**: Check `_bmad-output/` for generated documentation and artifacts
4. **Respect Workflow Structure**: Each workflow has specific inputs/outputs and should be followed in sequence

## Project Structure

```
COLOR PULSE MEDIA/           # Project root
├── _bmad/                   # BMAD framework files (read-only)
│   └── bmm/                 # Build Modern Method workflows
├── _bmad-output/            # Generated documentation and artifacts
│   └── implementation-artifacts/
├── .cursor/                 # Cursor AI rules
│   └── rules/bmad/         # BMAD Cursor integrations
├── .gemini/                 # Gemini AI commands
│   └── commands/           # BMAD Gemini integrations
├── logo/                    # Brand assets
└── CLAUDE.md                # This file
```

*Note: Project source files (Next.js app) will be added at root level during implementation phase.*

## Development Commands

*Note: This project is in early setup phase. Standard Next.js commands will be available once the project is scaffolded.*

Typical commands once initialized:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linting

## Architecture Guidelines

### Design Principles (from diginov.io reference)
- **Visual Structure**: Very airy blocks with significant whitespace
- **Typography**: Massive, bold fonts for headers
- **Copy**: Short, impactful phrases
- **Section Labels**: Use "//" prefix for section identifiers
- **KPIs**: Display key metrics prominently in hero section
- **CTAs**: Repetitive call-to-actions ("Get in touch", "Work with us")
- **Animations**: Modern reveal on scroll, stagger effects, animated counters

### Technical Architecture
- **Framework**: Next.js (React-based, SSR/SSG)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **CMS**: Strapi (headless CMS for content management)
- **Animations**: GSAP or native CSS/IntersectionObserver
- **i18n**: French and English language support

## Working with This Repository

### For New Development Tasks

1. **Start with workflow-status**: Understand current phase
2. **Follow BMAD workflows**: Use appropriate workflow for current phase
3. **Generate artifacts**: Ensure documentation is created in `_bmad-output/`
4. **Validate phase completion**: Check if prerequisites are met before moving to next phase

### For Code Changes

1. **Check existing documentation**: Review `_bmad-output/` for architectural decisions and specs
2. **Follow architecture decisions**: Adhere to decisions made in Architecture phase
3. **Update documentation**: Keep artifacts in sync with code changes
4. **Use code-review workflow**: Run adversarial review before completing stories

### Configuration Files

- No package.json yet - project in planning phase
- Git repository will be initialized during implementation phase

## Current Project Phase

The project is in the **Analysis/Planning** phase. Initial requirements gathering has been completed with the following understanding:

**User Goal**: Present Color Pulse Media's digital services network to B2B clients and generate qualified leads

**Key Requirements**:
- Single-page landing with clear service presentation
- Modern, bold design inspired by diginov.io
- Bilingual support (FR/EN)
- Strong CTAs throughout
- Animated, engaging experience

**Next Steps**: Complete PRD, Architecture, and Epics & Stories before implementation begins.
