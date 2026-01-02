import React, { useEffect, useRef, useState } from "react";
import { Application, Renderer, Assets, Sprite } from "pixi.js";
import {} from "pixi.js";
import face from "../Assets/pixi/face.png";
import neck from "../Assets/pixi/neck.png";
import eyes from "../Assets/pixi/eyes.png";
import eyeBr from "../Assets/pixi/eyebr.png";
import mouth from "../Assets/pixi/mouth.png";
import nose from "../Assets/pixi/nose.png";
import frontHairPng from "/frontHairs.png";
import rearHairFrontPng from "/rearHairsFront.png";
import rearHairBackPng from "/rearHairsBack.png";

import "../Styles/Pixi.css";
import { useAuth } from "@/AuthContext";
import { subscribeUserDoc } from "@/Data/firestore";

const PixiCharacter: React.FC = () => {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application<Renderer> | null>(null);
  const rearHairBackSpriteRef = useRef<Sprite | null>(null);
  const rearHairFrontSpriteRef = useRef<Sprite | null>(null);
  const frontHairSpriteRef = useRef<Sprite | null>(null);
  const { currentUser } = useAuth();
  const getDefaultCharData = () => ({
    backHairIndex: 1,
    frontColorIndex: 1,
    backColorIndex: 1,
    frontHairIndex: 1,
  });

  const [charData, setCharData] = useState<any>(() => {
    const cached = localStorage.getItem("charData");
    try {
      return cached ? JSON.parse(cached) : getDefaultCharData();
    } catch {
      return getDefaultCharData();
    }
  });

  const [backHairIndex, setBackHairIndex] = useState<number>(charData.backHairIndex ?? 1);
  const [frontColorIndex, setFrontColorIndex] = useState<number>(charData.frontColorIndex ?? 1);
  const [backColorIndex, setBackColorIndex] = useState<number>(charData.backColorIndex ?? 1);
  const [frontHairIndex, setFrontHairIndex] = useState<number>(charData.frontHairIndex ?? 1);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const unsub = subscribeUserDoc(uid, (data) => {
      const remote = data?.characterData;
      const next = remote && typeof remote === "object" ? remote : getDefaultCharData();
      localStorage.setItem("charData", JSON.stringify(next));
      setCharData(next);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  useEffect(() => {
    // sincroniza índices cuando llega charData
    setBackHairIndex(Number(charData?.backHairIndex ?? 1));
    setFrontColorIndex(Number(charData?.frontColorIndex ?? 1));
    setBackColorIndex(Number(charData?.backColorIndex ?? 1));
    setFrontHairIndex(Number(charData?.frontHairIndex ?? 1));
  }, [charData]);

  useEffect(() => {
    if (!appRef.current) {
      const app = new Application();
      appRef.current = app;

      (async () => {
        const myCanvas2 = document.createElement("canvas");
        myCanvas2.style.maxWidth = "144px";
        myCanvas2.style.maxHeight = "144px";

        await app.init({
          canvas: myCanvas2,
          background: "#c0a080",
          width: 100,
          height: 100,
        });

        pixiContainerRef.current?.appendChild(myCanvas2);

        const spNeck = new Sprite(await Assets.load(neck));
        spNeck.anchor.set(0.5, 0.5);
        const spFace = new Sprite(await Assets.load(face));
        spFace.anchor.set(0.5, 0.5);
        const spEyes = new Sprite(await Assets.load(eyes));
        spEyes.anchor.set(0.5, 0.5);
        const spEyeBr = new Sprite(await Assets.load(eyeBr));
        spEyeBr.anchor.set(0.5, 0.5);
        const spMouth = new Sprite(await Assets.load(mouth));
        spMouth.anchor.set(0.5, 0.5);
        const spNose = new Sprite(await Assets.load(nose));
        spNose.anchor.set(0.5, 0.5);

        app.stage.addChild(spNeck, spFace, spEyes, spEyeBr, spMouth, spNose);

        spNeck.x = app.screen.width / 2;
        spNeck.y = app.screen.height / 2;

        spFace.x = app.screen.width / 2;
        spFace.y = app.screen.height / 2;

        spEyes.x = app.screen.width / 2;
        spEyes.y = app.screen.height / 2;

        spEyeBr.x = app.screen.width / 2;
        spEyeBr.y = app.screen.height / 2;

        spMouth.x = app.screen.width / 2;
        spMouth.y = app.screen.height / 2;

        spNose.x = app.screen.width / 2;
        spNose.y = app.screen.height / 2;

        loadAllHair(
          charData.backHairIndex,
          charData.backColorIndex,
          charData.frontHairIndex,
          charData.frontColorIndex
        );
      })();
    }
  }, []);

  const [loadingHair, setLoadingHair] = useState(true);
  const isInitialLoadRef = useRef(true);
  const isLoadingRef = useRef(false);

  const loadAllHair = async (bIndex: number, bColor: number, fIndex: number, fColor: number) => {
    if (!appRef.current || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoadingHair(true);

    try {
      // ... limpieza ...
      // Limpieza garantizada antes de cargar nada nuevo
      if (rearHairBackSpriteRef.current) {
        appRef.current.stage.removeChild(rearHairBackSpriteRef.current);
        rearHairBackSpriteRef.current.destroy();
        rearHairBackSpriteRef.current = null;
      }
      if (rearHairFrontSpriteRef.current) {
        appRef.current.stage.removeChild(rearHairFrontSpriteRef.current);
        rearHairFrontSpriteRef.current.destroy();
        rearHairFrontSpriteRef.current = null;
      }
      if (frontHairSpriteRef.current) {
        appRef.current.stage.removeChild(frontHairSpriteRef.current);
        frontHairSpriteRef.current.destroy();
        frontHairSpriteRef.current = null;
      }

      // Carga Back Hair
      let rearHairBackSpritesheet;
      let rearHairFrontSpritesheet;
      
      if (!Assets.cache.has("rearHairBack")) {
        const sheetTextureRearBack = await Assets.load(rearHairBackPng);
        Assets.add({
          alias: "rearHairBack",
          src: "rearHairBack.json",
          data: { texture: sheetTextureRearBack },
        });
      }
      rearHairBackSpritesheet = await Assets.load("rearHairBack");

      if (!Assets.cache.has("rearHairFront")) {
        const sheetTextureRearFront = await Assets.load(rearHairFrontPng);
        Assets.add({
          alias: "rearHairFront",
          src: "rearHairFront.json",
          data: { texture: sheetTextureRearFront },
        });
      }
      rearHairFrontSpritesheet = await Assets.load("rearHairFront");

      const frameBackName = `rearHairBack${bIndex}-${bColor}`;
      const frameFrontName = `rearHairFront${bIndex}-${bColor}`;

      if (frameBackName in rearHairBackSpritesheet.textures) {
        const rearHairBackSprite = new Sprite(rearHairBackSpritesheet.textures[frameBackName]);
        rearHairBackSprite.anchor.set(0.5, 0.5);
        rearHairBackSprite.x = appRef.current.screen.width / 2;
        rearHairBackSprite.y = appRef.current.screen.height / 2;
        appRef.current.stage.addChildAt(rearHairBackSprite, 0);
        rearHairBackSpriteRef.current = rearHairBackSprite;

        const rearHairFrontSprite = new Sprite(rearHairFrontSpritesheet.textures[frameFrontName]);
        rearHairFrontSprite.anchor.set(0.5, 0.5);
        rearHairFrontSprite.x = appRef.current.screen.width / 2;
        rearHairFrontSprite.y = appRef.current.screen.height / 2;
        appRef.current.stage.addChildAt(rearHairFrontSprite, 0);
        rearHairFrontSpriteRef.current = rearHairFrontSprite;
      }

      // Carga Front Hair
      let frontHairSpritesheet;
      if (!Assets.cache.has("frontHair")) {
        const sheetTextureFront = await Assets.load(frontHairPng);
        Assets.add({
          alias: "frontHair",
          src: "frontHair.json",
          data: { texture: sheetTextureFront },
        });
      }
      frontHairSpritesheet = await Assets.load("frontHair");

      const frameName = `fronthair${fIndex}-${fColor}`;
      if (frameName in frontHairSpritesheet.textures) {
        const frontHairSprite = new Sprite(frontHairSpritesheet.textures[frameName]);
        frontHairSprite.anchor.set(0.5, 0.5);
        frontHairSprite.x = appRef.current.screen.width / 2;
        frontHairSprite.y = appRef.current.screen.height / 2;
        appRef.current.stage.addChild(frontHairSprite);
        frontHairSpriteRef.current = frontHairSprite;
      }

      // Ajuste final de z-index
      if (rearHairBackSpriteRef.current) appRef.current.stage.setChildIndex(rearHairBackSpriteRef.current, 0);
      if (rearHairFrontSpriteRef.current) appRef.current.stage.setChildIndex(rearHairFrontSpriteRef.current, appRef.current.stage.children.length - 2);
      if (frontHairSpriteRef.current) appRef.current.stage.setChildIndex(frontHairSpriteRef.current, appRef.current.stage.children.length - 1);

    } catch (e) {
      console.error("Error loading character hair:", e);
    } finally {
      isLoadingRef.current = false;
      isInitialLoadRef.current = false;
      setLoadingHair(false);
    }
  };

  useEffect(() => {
    loadAllHair(backHairIndex, backColorIndex, frontHairIndex, frontColorIndex);
  }, [backHairIndex, backColorIndex, frontHairIndex, frontColorIndex]);

  return (
    <div className="CharCont relative">
      {loadingHair && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#c0a080] z-10">
          <div className="w-6 h-6 border-2 border-[#795649] border-t-white animate-spin rounded-full"></div>
        </div>
      )}
      <div 
        ref={pixiContainerRef} 
        style={{ visibility: loadingHair ? 'hidden' : 'visible' }} 
      />
    </div>
  );
};

export default PixiCharacter;
