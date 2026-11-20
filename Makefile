.PHONY: check e2e dev

# Lighthouse uses Playwright's Chromium, so one browser serves every check.
CHROME_PATH := $(shell node -p 'require("@playwright/test").chromium.executablePath()' 2>/dev/null)

check:
	npx prettier --check .
	npx eslint .
	npx astro check
	npx vitest run --coverage
	node tools/content-lint/cli.ts
	python3 scripts/check-docs.py

e2e:
	npx astro build
	npx playwright test
	CHROME_PATH="$(CHROME_PATH)" npx lhci autorun

dev:
	npx astro dev
