import app from "ags/gtk4/app";
import style from "./style.scss";
import Bar from "./widget/Bar";
import Dashboard from "./widget/Dashboard";
import Botbar from "./widget/Botbar";
import Osd from "./widget/Osd";
import NotificationPopups from "./widget/notifications/NotificationPopups";

app.start({
  css: style,
  main() {
    console.log(app.get_gtk_theme());
    Bar(0);
    Dashboard(0);
    Osd();
    Botbar(0);
    NotificationPopups();
  },
});
