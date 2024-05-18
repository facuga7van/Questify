import React, { useRef } from "react";
// import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { Assets, Sprite } from "pixi.js";
import sprite from '../Assets/pixi/1.png';

const PixiCharacter: React.FC = () => {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  (async () =>
    {
        // Create a PixiJS application.
        const app = new Application();
    
        // Intialize the application.
        await app.init({ background: '#1099bb', width: window.innerWidth, height: 100 });
    
        // Then adding the application's canvas to the DOM body.
        document.body.appendChild(app.canvas);
    
        // Load the bunny texture.
        const texture = await Assets.load(sprite);
    
        // Create a new Sprite from an image path
        const bunny = new Sprite(texture);
    
        // Add to stage
        app.stage.addChild(bunny);
    
        // Center the sprite's anchor point
        bunny.anchor.set(0.5);
    
        // Move the sprite to the center of the screen
        bunny.x = 50; // Set x position to 100 pixels from the left edge
        bunny.y = 40; // Set y position to 150 pixels from the top edge
    })();

  return <div ref={pixiContainerRef} />;
};

export default PixiCharacter;
