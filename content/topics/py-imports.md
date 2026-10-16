---
id: py-imports
title: Modules, imports and packaging
summary: What import does, and how venv, pip and pyproject fit
why: '"It works on my machine" in Python is almost always an import path or an environment problem; knowing the mechanics turns it into a five-minute fix.'
requires: [py-bytecode]
lesson: none
points:
  - title: A module runs once
    text: The first import executes the file top to bottom and caches the module object in sys.modules; later imports just look it up.
  - title: sys.path decides
    text: Python searches a list of directories in order, starting with the script's own directory, so a local file named like a library can shadow it.
  - title: One environment per project
    text: A virtual environment is a separate site-packages directory with its own pip, so projects don't fight over versions.
  - title: pyproject.toml describes the project
    text: Its [project] table lists the name, version and dependencies, and [build-system] says which tool builds the package.
quiz_hint: Ask which interpreter is running, what is on its sys.path, and whether the module is already in sys.modules.
quiz:
  - q: Two modules import each other at the top, and one uses an attribute of the other at import time. What usually happens?
    options: [Python merges them into one module, "AttributeError: partially initialized module ... (most likely due to a circular import)", An infinite loop]
    answer: 1
    explain: The first module is placed in sys.modules before its body finishes. The second gets that half-built module back and fails when it reaches for a name not yet defined. Move the shared code into a third module, or import inside the function that needs it.
  - q: You create a file called `json.py` next to your script. What does `import json` in the script now load?
    options: [The standard library json, Your json.py, An ImportError]
    answer: 1
    explain: The script's directory comes first on sys.path, so your file shadows the standard library module. Rename it.
  - q: On a recent macOS (Homebrew) or Debian/Ubuntu system Python, `pip install requests` fails with "externally-managed-environment". What is the intended fix?
    options: [Add --break-system-packages every time, "Create a virtual environment (python3 -m venv .venv) and install there", Install as root with sudo]
    answer: 1
    explain: PEP 668 lets distributions mark their Python as managed by the system package manager, so pip refuses to change it. A venv gives you a private environment you can install anything into.
links:
  - { title: "The import system (Python docs)", url: "https://docs.python.org/3/reference/import.html" }
  - { title: "venv: creation of virtual environments (Python docs)", url: "https://docs.python.org/3/library/venv.html" }
  - { title: "Writing your pyproject.toml (Python Packaging User Guide)", url: "https://packaging.python.org/en/latest/guides/writing-pyproject-toml/" }
  - { title: "PEP 668: Marking Python base environments as externally managed", url: "https://peps.python.org/pep-0668/" }
---
`import x` is a statement that runs code. The first time a module is imported, Python finds the file, compiles it, executes it top to bottom in a fresh module namespace, and stores the resulting module object in `sys.modules`. Every later `import x` anywhere in the program gets that same object back. Packaging tools, virtual environments and `pyproject.toml` all exist to control which files that search finds.

## What import does

```python
import sys
import json

print("json" in sys.modules)   # True
import json as again
print(again is json)           # True: the second import is a dict lookup
print(json.__name__, __name__) # json __main__
```

Because a module body runs only once, module-level code acts as one-time setup, and module-level variables act as process-wide singletons. The file you run directly is named `"__main__"` rather than its file name, which is what the `if __name__ == "__main__":` guard tests: that code runs when the file is executed as a script but not when it is imported.

A **package** is a directory of modules, normally with an `__init__.py` that runs when the package is first imported. `from . import models` is a relative import inside a package; it only works when the file is imported as part of that package (for example with `python -m mypkg.cli`), not when run as a loose script.

Imports run in order, and a module is registered in `sys.modules` before its body finishes. That is why circular imports fail in a confusing way: if `a` imports `b` and `b` immediately uses `a.X`, `b` gets the half-initialised `a` and raises `AttributeError: partially initialized module 'a' has no attribute 'X' (most likely due to a circular import)`.

## Where Python looks

The search goes through `sys.path` in order: the directory of the script (or the current directory for `-m` and the REPL), then entries from `PYTHONPATH`, then the standard library, then `site-packages`, where installed packages live. First match wins. A file called `random.py` or `json.py` in your project shadows the standard module, a classic source of baffling errors.

## Virtual environments

Each Python installation has one `site-packages`. A virtual environment is a lightweight directory with its own `site-packages` and a `python` that uses it, while sharing the base interpreter's standard library:

```sh
python3 -m venv .venv            # create it (once per project)
source .venv/bin/activate        # put .venv/bin first on PATH (Windows: .venv\Scripts\activate)
python -m pip install requests   # installs into .venv only
```

Activation only changes `PATH`; running `.venv/bin/python` directly works just as well. Using `python -m pip` rather than a bare `pip` guarantees that pip installs into the interpreter you are actually going to run. Many Linux distributions and Homebrew now mark their system Python as externally managed (PEP 668), so pip refuses to install into it outside a venv.

## pyproject.toml

Modern projects describe themselves in `pyproject.toml`. The `[project]` table (PEP 621) holds the name, version, `requires-python` and `dependencies`; `[build-system]` (PEP 517 and 518) names the backend, such as setuptools, hatchling or flit-core, that turns the source into a **wheel**, the pre-built archive pip installs. `pip install .` reads this file, builds a wheel and installs it. Dependency lists in `pyproject.toml` say what a package can work with; to pin exact versions for an application, use a lock file. Tools such as pip-tools, Poetry, PDM and uv produce them, and PEP 751 defines a standard `pylock.toml` format.
