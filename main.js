let editor, pyodideReady = false, pyodide;

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' } });

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: "// Write JavaScript, HTML, or Python here!",
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
      const originalLog = console.log;
      console.log = (...args) => {
        output.innerHTML += args.join(" ") + "<br>";
      };
      eval(code);
      console.log = originalLog;
    } catch (e) {
      output.innerHTML = `<span style="color:red">${e}</span>`;
    }
  } else if (lang === 'html') {
    const iframe = document.createElement("iframe");
    iframe.srcdoc = code;
    output.innerHTML = '';
    output.appendChild(iframe);
  } else if (lang === 'python') {
    try {
      if (!pyodideReady) {
        pyodide = await loadPyodide();
        pyodideReady = true;
      }
      let result = await pyodide.runPythonAsync(code);
      output.textContent = result ?? "Executed.";
    } catch (err) {
      output.innerHTML = `<span style="color:red">${err}</span>`;
    }
  }
}
