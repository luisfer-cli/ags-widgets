import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./widget/Bar";
import Dashboard from "./widget/Dashboard";
import Botbar from "./widget/Botbar";
import Osd from "./widget/Osd";

app.start({
  css: style,
  main() {
    Bar(0);
    Dashboard(0);
    app.get_monitors().map(Osd);
    Botbar(0);
  },
});
