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

import { IpcRendererEvent } from "electron";

import "../Styles/Pixi.css";
import { useAuth } from "@/AuthContext";

const PixiCharacter: React.FC = () => {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application<Renderer> | null>(null);
  const rearHairBackSpriteRef = useRef<Sprite | null>(null);
  const rearHairFrontSpriteRef = useRef<Sprite | null>(null);
  const frontHairSpriteRef = useRef<Sprite | null>(null);
  const ipcRenderer = (window as any).ipcRenderer;
  const { currentUser } = useAuth();
  const [getCharData, setGetCharData] = useState(false);
  const [charData, setCharData] = useState<any>();

  useEffect(() => {
    const handleCharData = (event: IpcRendererEvent, charData: any) => {
      if (1 > 2) {
        console.log(event);
      }
      if (!charData || charData === undefined || charData.length == 0) {
        localStorage.setItem(
          "charData",
          JSON.stringify({
            backHairIndex: 1,
            frontColorIndex: 1,
            backColorIndex: 1,
            frontHairIndex: 1,
          })
        );
      } else {
        localStorage.setItem("charData", JSON.stringify(charData));
        loadBackHairSprite(charData.backHairIndex, charData.backColorIndex);
        loadFrontHairSprite(charData.frontHairIndex, charData.frontColorIndex);
        setGetCharData(false);
      }
      setCharData(localStorage.getItem("charData"));
      console.log(charData)
    };
    if (getCharData) {
      ipcRenderer.send("getCharacter", currentUser?.uid);
    }
    ipcRenderer.on("sendCharData", handleCharData);
    return () => {
      ipcRenderer.removeAllListeners("sendCharData", handleCharData);
    };
  }, [getCharData]);

  useEffect(() => {
    console.log(nose);
    setGetCharData(true);
  }, []);

  
  const [backHairIndex] = useState(1);
  const [frontColorIndex] = useState(1);
  const [backColorIndex] = useState(1);
  const [frontHairIndex] = useState(1);
  // const [backHairIndex] = useState(charData.backHairIndex);
  // const [frontColorIndex] = useState(charData.frontColorIndex);
  // const [backColorIndex] = useState(charData.backColorIndex);
  // const [frontHairIndex] = useState(charData.frontHairIndex);

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

        loadBackHairSprite(charData.backHairIndex, charData.backColorIndex);
        loadFrontHairSprite(charData.frontHairIndex, charData.frontColorIndex);
      })();
    }
  }, []);

  const loadBackHairSprite = async (index1: number, index2: number) => {
    if (!appRef.current) {
      console.error("App not initialized");
      return;
    }
    let rearHairBackSpritesheet;
    let rearHairFrontSpritesheet;
    if (appRef.current) {
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

      if (!Assets.cache.has("rearHairBack")) {
        const sheetTextureRearBack = await Assets.load(rearHairBackPng);
        Assets.add({
          alias: "rearHairBack",
          src: "rearHairBack.json",
          data: { texture: sheetTextureRearBack },
        });
        rearHairBackSpritesheet = await Assets.load("rearHairBack");
      } else {
        rearHairBackSpritesheet = await Assets.load("rearHairBack");
      }
      if (!Assets.cache.has("rearHairFront")) {
        const sheetTextureRearFront = await Assets.load(rearHairFrontPng);
        Assets.add({
          alias: "rearHairFront",
          src: "rearHairFront.json",
          data: { texture: sheetTextureRearFront },
        });
        rearHairFrontSpritesheet = await Assets.load("rearHairFront");
      } else {
        rearHairFrontSpritesheet = await Assets.load("rearHairFront");
      }

      const frameBackName = `rearHairBack${index1}-${index2}`;
      const frameFrontName = `rearHairFront${index1}-${index2}`;
      if (frameBackName in rearHairBackSpritesheet.textures) {
        const cacheTextureRearBack = Assets.cache.get(frameBackName);
        const cacheTextureRearFront = Assets.cache.get(frameFrontName);
        const rearHairBackTexture =
          cacheTextureRearBack ||
          rearHairBackSpritesheet.textures[
            frameBackName as keyof typeof rearHairBackSpritesheet.textures
          ];
        const rearHairFrontTexture =
          cacheTextureRearFront ||
          rearHairFrontSpritesheet.textures[
            frameFrontName as keyof typeof rearHairFrontSpritesheet.textures
          ];

        const rearHairBackSprite = new Sprite(rearHairBackTexture);
        rearHairBackSprite.anchor.set(0.5, 0.5);
        rearHairBackSprite.x = appRef.current.screen.width / 2;
        rearHairBackSprite.y = appRef.current.screen.height / 2;

        appRef.current.stage.addChildAt(rearHairBackSprite, 0);
        rearHairBackSpriteRef.current = rearHairBackSprite;

        const rearHairFrontSprite = new Sprite(rearHairFrontTexture);
        rearHairFrontSprite.anchor.set(0.5, 0.5);
        rearHairFrontSprite.x = appRef.current.screen.width / 2;
        rearHairFrontSprite.y = appRef.current.screen.height / 2;

        appRef.current.stage.addChildAt(rearHairFrontSprite, 0);
        rearHairFrontSpriteRef.current = rearHairFrontSprite;
      }
      if (rearHairBackSpriteRef.current) {
        appRef.current.stage.setChildIndex(rearHairBackSpriteRef.current, 0);
      }
      if (rearHairFrontSpriteRef.current) {
        appRef.current.stage.setChildIndex(
          rearHairFrontSpriteRef.current,
          appRef.current.stage.children.length - 2
        );
      }
    }
  };

  const loadFrontHairSprite = async (index1: number, index2: number) => {
    if (!appRef.current) {
      console.error("App not initialized");
      return;
    }

    let sheetTextureFront;
    let frontHairSpritesheet;
    console.log(index1);
    if (appRef.current) {
      if (frontHairSpriteRef.current) {
        appRef.current.stage.removeChild(frontHairSpriteRef.current);
        frontHairSpriteRef.current.destroy();
        frontHairSpriteRef.current = null;
      }

      if (!Assets.cache.has("frontHair")) {
        sheetTextureFront = await Assets.load(frontHairPng);
        Assets.add({
          alias: "frontHair",
          src: "frontHair.json",
          data: { texture: sheetTextureFront },
        });
        frontHairSpritesheet = await Assets.load("frontHair");
      } else {
        frontHairSpritesheet = await Assets.load("frontHair");
      }

      const frameName = `fronthair${index1}-${index2}`;
      if (frameName in frontHairSpritesheet.textures) {
        const frontHairTexture =
          frontHairSpritesheet.textures[
            frameName as keyof typeof frontHairSpritesheet.textures
          ];

        const frontHairSprite = new Sprite(frontHairTexture);
        frontHairSprite.anchor.set(0.5, 0.5);
        frontHairSprite.x = appRef.current.screen.width / 2;
        frontHairSprite.y = appRef.current.screen.height / 2;

        appRef.current.stage.addChild(frontHairSprite);
        frontHairSpriteRef.current = frontHairSprite;
      } else {
        console.error(`Hair frame "${frameName}" not found in textures`);
      }
      if (frontHairSpriteRef.current) {
        appRef.current.stage.setChildIndex(
          frontHairSpriteRef.current,
          appRef.current.stage.children.length - 1
        );
      }
    }
  };

  useEffect(() => {
    loadBackHairSprite(backHairIndex, backColorIndex);
  }, [backHairIndex, backColorIndex]);

  useEffect(() => {
    loadFrontHairSprite(frontHairIndex, frontColorIndex);
  }, [frontHairIndex, frontColorIndex]);

  return <div className="CharCont" ref={pixiContainerRef} />;
};

export default PixiCharacter;
