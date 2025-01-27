import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { SPHttpClient } from '@microsoft/sp-http';

export const setupViewer = async (container: HTMLElement, context: any, fileUrls: string[]) => {
    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();

    world.scene = new OBC.SimpleScene(components);
    world.camera = new OBC.OrthoPerspectiveCamera(components);
    world.renderer = new OBF.PostproductionRenderer(components, container);

    world.scene.setup();

    const ifcLoader = components.get(OBC.IfcLoader);
    await ifcLoader.setup();

    for (const relativeUrl of fileUrls) {
        try {
            const absoluteUrl = `${context.pageContext.web.absoluteUrl}${relativeUrl}`;
            const response = await context.spHttpClient.get(
                absoluteUrl,
                SPHttpClient.configurations.v1
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const buffer = await response.arrayBuffer();
            const model = await ifcLoader.load(new Uint8Array(buffer));
            world.scene.three.add(model);

        } catch (error) {
            console.error('Error loading IFC:', error);
        }
    }

    await world.camera.fit(world.scene.three.children);

    return () => {
        components.dispose();
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    };
};