// npm run content:validate — schema, prerequisite graph, glossary coverage and widget registry checks
// for everything under content/. Rules: docs/03-LESSON-SPEC.md. Logic: lib/content/validate.ts.
import { formatReport, validateContent } from "../lib/content/validate";

const report = await validateContent();
const text = formatReport(report);
if (text) console.log(text);
if (report.errors.length > 0) {
  console.error(`content:validate — ${report.errors.length} error(s) in ${report.lessons.length} lesson(s).`);
  process.exit(1);
}
console.log(`content:validate — ${report.lessons.length} lesson(s) valid, ${report.warnings.length} warning(s).`);
