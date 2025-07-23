import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./widget/Bar";
import Dashboard from "./widget/Dashboard";
import Botbar from "./widget/Botbar";
import Osd from "./widget/Osd";
import NotificationManager from "./widget/Notification";

app.start({
  css: style,
  main() {
    Bar(0);
    Dashboard(0);
    Osd();
    Botbar(0);
    NotificationManager();
  },
});
