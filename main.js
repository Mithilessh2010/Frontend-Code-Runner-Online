let editor, pyodideReady = false, pyodide;

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' } });

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: "console.log('Hello from JavaScript!');",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true
  });
});

language.onchange = () => {
  const lang = language.value;
  const starter = {
    javascript: "console.log('Hello from JavaScript!');",
    html: "<!DOCTYPE html><html><body><h1>Hello from HTML</h1></body></html>",
    python: "print('Hello from Python via Pyodide!')"
  };
  editor.setValue(starter[lang]);
  monaco.editor.setModelLanguage(editor.getModel(), lang === 'html' ? 'html' : lang);
};

async function runCode() {
  const lang = language.value;
  const code = editor.getValue();
  const output = document.getElementById("output");
  output.innerHTML = '';

  if (lang === 'javascript') {
    try {
      const oldLog = console.log;
      let logs = [];
      console.log = (...args) => logs.push(args.join(" "));
      eval(code);
      output.innerHTML = logs.join("<br>") || "✅ No output.";
      console.log = oldLog;
    } catch (e) {
      output.innerHTML = `<span style="color:red">${e}</span>`;
    }
  } else if (lang === 'html') {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.srcdoc = code;
    output.innerHTML = '';
    output.appendChild(iframe);
  } else if (lang === 'python') {
    try {
      if (!pyodideReady) {
        pyodide = await loadPyodide();
        pyodideReady = true;
      }

      let stdout = '';
      pyodide.setStdout({
        batched: (s) => stdout += s + '\n',
      });
      pyodide.setStderr({
        batched: (s) => stdout += `<span style="color:red">${s}</span>\n`,
      });

      await pyodide.runPythonAsync(code);
      output.innerHTML = stdout.trim() || "✅ No output.";
    } catch (err) {
      output.innerHTML = `<span style="color:red">${err}</span>`;
    }
  }
}
