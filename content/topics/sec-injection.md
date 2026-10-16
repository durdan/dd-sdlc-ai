---
id: sec-injection
title: "Injection: keep data out of the code"
summary: Parameterised queries, safe APIs, and escaping for the right context
why: "Injection has been on every OWASP Top 10. It happens whenever untrusted text is glued into something an interpreter runs, and the fix is the same each time: keep data and code separate."
requires: [sec-owasp-top10]
lesson: none
points:
  - title: The root cause
    text: "A query, command or template is built by concatenating strings, so input can change its structure instead of just filling a value."
  - title: Parameterise
    text: "Send the query and the values separately. The database never parses the values as SQL, whatever they contain."
  - title: Avoid the interpreter
    text: "Call programs with an argument array instead of a shell string; use DOM APIs like textContent instead of innerHTML."
  - title: Validate as a second layer
    text: "Allow-list formats (an ID is digits, a sort column is one of three names). Validation helps, but it doesn't replace parameterisation."
quiz:
  - q: Which line is safe from SQL injection?
    code: |
      db.query("SELECT * FROM users WHERE email = '" + email + "'")   // A
      db.query("SELECT * FROM users WHERE email = $1", [email])       // B
      db.query(`SELECT * FROM users WHERE email = '${email.replace("'", "")}'`) // C
    options: ["A", "B", "C"]
    answer: 1
    explain: "B sends the value separately from the SQL. C strips only the first quote, and hand-written escaping misses cases; never rely on it."
  - q: "You need to let users sort by a column name, which can't be a query parameter. What is the safe approach?"
    options: ["Escape the column name", "Map the user's choice to one of a fixed set of known column names in code", "Put it in quotes"]
    answer: 1
    explain: "Identifiers can't be bound as parameters, so allow-list them: { name: 'name', date: 'created_at' }[input], and reject anything else."
  - q: "How should a program call `convert` with a user-supplied file name?"
    options: ["exec(\"convert \" + name + \" out.png\")", "Run the program with an argument array, such as execFile(\"convert\", [name, \"out.png\"]), and validate the name", "Wrap the name in double quotes in the shell string"]
    answer: 1
    explain: "With an argument array no shell parses the input, so characters like ; | and $() have no special meaning. Also guard against names starting with - being read as options."
links:
  - { title: "A05:2025 Injection (OWASP Top 10)", url: "https://top10.owasp.org/2025/A05_2025-Injection/" }
  - { title: "SQL Injection Prevention Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" }
  - { title: "OS Command Injection Defense Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" }
---
Injection happens when untrusted input is pasted into a string that something else will interpret: a SQL query, a shell command, an HTML page, a template, an LDAP filter, a log line. If the input contains characters the interpreter treats as syntax, it changes the meaning of the command. Every fix comes down to the same rule: **send data as data**, through an API that keeps it separate from code.

## SQL: parameterise

Look at what a string-built query actually becomes when the input contains a quote:

```js run
function buildQueryUnsafe(email) {
  return "SELECT id FROM users WHERE email = '" + email + "'"
}
const inputs = ["ana@example.com", "o'brien@example.com", "x' OR '1'='1"]
for (const input of inputs) console.log(buildQueryUnsafe(input))

// A parameterised query keeps the SQL text fixed; values travel separately.
const prepared = { text: "SELECT id FROM users WHERE email = $1", values: [inputs[2]] }
console.log(JSON.stringify(prepared))
```

The second input merely breaks the query; the third turns the `WHERE` clause into one that is always true. With a parameterised query (`$1`, `?` or `:email`, depending on the driver) the SQL text is fixed before any value arrives, so the database treats the whole input as one string to compare, whatever it contains.

Every mainstream driver and ORM supports parameters. The traps are the escape hatches: raw-query helpers, string templates passed to `query()`, and parts of SQL that can't be parameters, such as table names, column names and `ORDER BY` direction. For those, map user choices to a fixed allow-list in code.

## Shell commands: skip the shell

`exec("convert " + name)` starts a shell, and the shell interprets `;`, `|`, `$( )` and backticks in `name`. Prefer a library that does the job directly. If you must run a program, use the form that takes an **argument array** (`execFile`/`spawn` in Node, `subprocess.run([...])` in Python with `shell=False`), so no shell parses anything. Validate arguments and use `--` before file names so a name like `-rf` isn't read as an option.

## HTML: escape for the context

Cross-site scripting is injection into HTML or JavaScript. Use your framework's default escaping, `textContent` and `setAttribute` instead of `innerHTML`, and a Content Security Policy as a second wall. The browser security topic covers this in detail.

## Other interpreters

The same pattern shows up in templates (server-side template injection when user input becomes a template rather than a value passed to one), NoSQL queries (a JSON body where a string was expected becomes an operator such as `{"$ne": null}`), LDAP and XPath filters, HTTP headers (newlines in values), and log files (newlines that forge log lines). The fix each time: the API's parameter mechanism, type checks on input shape, and encoding for the output context.

## Layers

1. **Safe APIs** that separate data from code: the main defence.
2. **Input validation** on type, length and format, using allow-lists.
3. **Least privilege** for the database user or process, so a mistake can do less.
4. **Tests and tools**: static analysis that flags string-built queries, and tests that send quotes and metacharacters to every input.
