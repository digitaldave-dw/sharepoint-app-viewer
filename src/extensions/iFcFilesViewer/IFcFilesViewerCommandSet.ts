import { Log } from '@microsoft/sp-core-library';
import { Dialog } from '@microsoft/sp-dialog';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */

export interface IIFcFilesViewerCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'IFcFilesViewerCommandSet';

export default class IFcFilesViewerCommandSet extends BaseListViewCommandSet<IIFcFilesViewerCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized IFcFilesViewerCommandSet');

    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    compareOneCommand.visible = true;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1': {
        const fileRef = event.selectedRows[0].getValueByName('FileRef');
        const viewerUrl = `${this.context.pageContext.web.absoluteUrl}/_layouts/15/workbench.aspx?` +
          `loadSPFX=true&` +
          `debugManifestsFile=https://localhost:4321/temp/manifests.js&` +
          `fileUrl=${encodeURIComponent(fileRef)}`;
  
        window.open(viewerUrl, '_blank', 'width=1600,height=900');
        break;
      }
      default:
        throw new Error('Unknown command');
    }
  }  
  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    const command = this.tryGetCommand('COMMAND_1');
    if (command) {
      const selectedFileType = this.context.listView.selectedRows?.[0]?.getValueByName('File_x0020_Type');
      command.visible = this.context.listView.selectedRows?.length === 1 && selectedFileType?.toLowerCase() === 'ifc';
      console.log('Fields in row 0', this.context.listView.selectedRows[0].fields);
    }
    this.raiseOnChange();
  }
}
