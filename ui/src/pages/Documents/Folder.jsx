import { useState } from "react";
import Navbar from 'react-bootstrap/Navbar';
import { Button, InputGroup, Form } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
import { BsFillGridFill } from "react-icons/bs";
import { FaList } from "react-icons/fa";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

import apiservice from "../../services/api.service"
import styles from "./Documents.module.scss"

import Upload from "./Upload"
import FileList from "./FileList";
import NameTag from "../../components/NameTag"
import { toast } from "react-toastify";

export default function Folder({ selection, onSelect, onUpdate }) {
  const [listStyle, setListStyle] = useState("list");
  const [folderName, setFolderName] = useState("");
  const [showCreateFileModal, setShowCreateFolder] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const folder = selection

  const onCreateFolderClick = async () => {
    await apiservice.createFolder({ name: folderName, parentId: selection.id });
    console.log("created folder with id", res.ID);
    setFolderName("");
    setShowCreateFolder(false);
    
    onUpdate();
  }

  const onDeleteClick = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the selected item(s)?`)) return;
    for (const id of selectedIds) {
      const file = folder.children.find(f => f.id === id);
      const name = file?.data?.name || id;
      try {
        await apiservice.deleteDocument(id);
        toast.success(`Deleted ${name}`);
      } catch (e) {
        toast.error(`Failed to delete ${name}`);
      }
    }
    setSelectedIds([]);
    onUpdate();
  }

  const fileUploaded = () => {
    onUpdate();
  }

  const handleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // this should generally not happen, but just in case
  if (!folder) {
    return "nothing selected"
  }
  return (
    <>
      <Navbar style={{ marginLeft: '-12px' }}>
        { folder && (<div><NameTag node={folder} onSelect={onSelect} /></div>) }
      </Navbar>

      <Navbar className={styles.filedivider}>
        <Button size="sm" variant="outline" onClick={() => setShowCreateFolder(true)}>Create Folder</Button>
        <div className={styles.stretch}></div>
        <Button size="sm" onClick={onDeleteClick} disabled={selectedIds.length === 0}>Delete</Button>
        <ToggleButtonGroup value={listStyle} onChange={(v) => setListStyle(v)} name="abc">
          <ToggleButton id="grid" name="grid" size="sm" value="grid" variant="outline">
            <BsFillGridFill />
          </ToggleButton>
          <ToggleButton id="list" name="list" size="sm" value="list" variant="outline">
            <FaList />
          </ToggleButton>
        </ToggleButtonGroup>
      </Navbar>

      <Upload filesUploaded={fileUploaded} uploadFolder={selection.id}></Upload>
      <FileList
        listStyle={listStyle}
        files={folder.children}
        onSelect={onSelect}
        selectedIds={selectedIds}
        onSelectItem={handleSelectItem}
      />

      <Modal show={showCreateFileModal} onHide={() => setShowCreateFolder(false)}>
        <Modal.Header closeButton>
          Create a new folder
        </Modal.Header>

        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control autoFocus={true} type="text" value={folderName} onChange={(e) => setFolderName(e.currentTarget.value)} />

            <Button variant="primary" onClick={onCreateFolderClick}>Create</Button>

          </InputGroup>
        </Modal.Body>
      </Modal>
    </>
  );
}
