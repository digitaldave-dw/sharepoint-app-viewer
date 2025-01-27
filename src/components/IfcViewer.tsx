import * as React from 'react';
import { setupViewer } from './SetupViewer';

export const IfcViewer: React.FC<{ context: any }> = ({ context }) => {
    const viewerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const fileUrl = urlParams.get('fileUrl');

        if (viewerRef.current && fileUrl) {
            let cleanupFunction: (() => void) | undefined;
            
            void setupViewer(viewerRef.current, context, [fileUrl])
                .then(cleanup => {
                    cleanupFunction = cleanup;
                });

            return () => {
                if (cleanupFunction) {
                    cleanupFunction();
                }
            };
        }
    }, [context]);

    return <div ref={viewerRef} style={{ width: '100%', height: '100vh' }} />;
};