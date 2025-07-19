import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./widget/Bar";
import Dashboard from "./widget/Dashboard";

app.start({
  css: style,
  main() {
    Bar(0);
    Dashboard(0);
  },
});
