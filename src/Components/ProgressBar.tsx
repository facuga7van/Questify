import { useEffect, useState } from "react";
import "../Styles/ProgressBar.css";
import { useAuth } from "../AuthContext/index";
import { subscribeUserDoc } from "@/Data/firestore";


export default function Progressbar() {
  const [level, setLevel] = useState(0);
  const [filled, setFilled] = useState(0);
  const [userData, setUserData] = useState<any>(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : {};
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const unsub = subscribeUserDoc(uid, (data) => {
      const xp = Number(data?.currentXp ?? 0);
      const calculatedLevel = xp / 100;
      setLevel(Math.floor(calculatedLevel));

      setUserData((prev: any) => {
        const next = { ...(prev ?? {}), level: Math.floor(calculatedLevel) };
        localStorage.setItem("userData", JSON.stringify(next));
        return next;
      });

      const levelPercentage = calculatedLevel - Math.floor(calculatedLevel);
      setFilled(levelPercentage * 100);
    });

    return () => unsub();
  }, [currentUser?.uid]);


  return (
    <div>
      <div className="progressbar">
        <div
          className="xpBar"
          style={{
            width: `${filled}%`,
            transition: "width 0.5s",
          }}
        />
        <span className="progressPercent">{level}</span>
        
      </div>
    </div>
  );
}
