import express from "express";

let app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let projects = [
  {
    id: "abc",
    name: "project 1",
    description: "this is project 1",
    tasks: [{ id: "1", name: "do the dishes", complete: true }],
  },
  {
    id: "xyz",
    name: "project 2",
    description: "this is project 2",
    tasks: [],
  },
  {
    id: "lmno",
    name: "project 3",
    description: "this is project 3",
    tasks: [],
  },
];

app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html`
    <body class="main">
      <header>
        <h1>iframes, fam</h1>
      </header>
      <div class="layout-container">
        <iframe
          lazy
          name="nav"
          src="nav/"
          style="height: 100%"
          frameborder="0"
        ></iframe>
        <iframe
          lazy
          name="main"
          src="new/"
          style="height: 100%"
          frameborder="0"
        ></iframe>
      </div>
    </body>
  `);
  res.end();
});

app.get("/nav", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html`
    <nav>
      <p><a href="/new/" target="main">New Project</a></p>
      <ul>
        ${projects
          .map(
            project =>
              html`<li>
                <a href="/project/${project.id}/" target="main"
                  >${project.name}</a
                >
              </li>`,
          )
          .join("")}
      </ul>
    </nav>
  `);
  res.end();
});

app.all("/new", async (req, res) => {
  if (req.method === "POST") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let project = {
      id: Math.random().toString().slice(2, 8),
      name: req.body.name,
      description: req.body.description,
      tasks: [],
    };
    projects.unshift(project);
    res.writeHead(303, { Location: `/project/${project.id}/` });
    res.end();
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html`
    <h1>New Project</h1>
    <form target="main" method="post" onsubmit="this.btn.disabled = true">
      <revalidate-frame target="nav" />
      <p>
        <label for="name">Name</label><br />
        <input type="text" name="name" id="name" />
      </p>
      <p>
        <label for="desc">Description</label><br />
        <textarea name="description" id="desc"></textarea>
      </p>
      <p>
        <button name="btn" type="submit">Create</button>
      </p>
    </form>
  `);
  res.end();
});

app.get("/home", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html`
    <h1>Home</h1>
    <p>Click a link on the left</p>
  `);
  res.end();
});

app.get("/project/:id", (req, res) => {
  let project = projects.find(project => project.id === req.params.id);

  if (!project) {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("Project not found");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html`
    <h1>${project.name}</h1>
    <p>${project.description}</p>
    <form
      target="tasks"
      method="post"
      action="tasks/"
      onsubmit="this.task.select()"
    >
      <p>
        <input type="text" name="task" placeholder="add task" />
        <button type="submit">Add</button>
      </p>
    </form>
    <iframe lazy name="tasks" src="tasks/" frameborder="0"></iframe>
    <script>
      let frame = document.querySelector("iframe[name=tasks]");
      let form = document.querySelector("form");
      let button = form.querySelector("button[type=submit]");
      form.addEventListener("submit", e => {
        form.elements[0].select();
        button.disabled = true;
        function handleLoad() {
          frame.removeEventListener("load", handleLoad);
          button.disabled = false;
        }
        frame.addEventListener("load", handleLoad);
      });
    </script>
  `);
  res.end();
});

app.all("/project/:id/tasks", async (req, res) => {
  let project = projects.find(project => project.id === req.params.id);

  if (!project) {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("Project not found");
    return;
  }

  if (req.method === "POST") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    project.tasks.unshift({
      id: Math.random().toString().slice(2, 8),
      name: req.body.task,
    });
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(
    project.tasks
      .map(
        task =>
          html`
            <iframe
              name="${`task:${task.id}`}"
              src="${task.id}/"
              frameborder="0"
              style="width: 100%; height: 1.25em"
            ></iframe>
          `,
      )
      .join(""),
  );
  res.end();
});

app.all("/project/:project/tasks/:task", (req, res) => {
  let project = projects.find(project => project.id === req.params.project);
  let task = project.tasks.find(task => task.id === req.params.task);

  if (req.method === "POST") {
    task.complete = req.body.complete === "on";
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html`
    <body style="overflow: hidden">
      <form method="post" target="${`task:${task.id}`}" style="margin:0">
        <label
          ><input
            type="checkbox"
            ${task.complete ? "checked" : ""}
            onchange="this.form.submit()"
            name="complete"
          />
          ${task.name}</label
        >
      </form>
    </body>
  `);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

function html(strings, ...values) {
  let body = "";
  for (let i = 0; i < strings.length; i++) {
    body += strings[i];
    if (values[i]) {
      body += values[i];
    }
  }
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <title>iframes, fam</title>
      <link rel="stylesheet" href="/app.css" />
      <script src="/components.mjs" type="module"></script>
    </head>
    ${body}
  </html>
  `;
}
