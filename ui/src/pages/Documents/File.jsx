import { useState, useEffect, useRef, useMemo } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import Navbar from 'react-bootstrap/Navbar';
import { FaChevronRight, FaChevronLeft, } from "react-icons/fa6";
import { AiOutlineDownload } from "react-icons/ai";
import constants from "../../common/constants";

import apiservice from "../../services/api.service"
import NameTag from "../../components/NameTag"

import { pdfjs, Document, Page } from "react-pdf";
// import 'react-pdf/dist/Page/AnnotationLayer.css';
// import 'react-pdf/dist/Page/TextLayer.css';
// import 'react-pdf/dist/Page/TextLayer.css';
//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js"
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString(); 

import { RmLinesRenderer } from "../../components/RmLinesRenderer";
import { generateDocumentEnvironment } from '../../common/blobapi';

export default function FileViewer({ file, onSelect }) {
  const { data } = file;

  const downloadUrl = `${constants.ROOT_URL}/documents/${file.id}`;

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  // TODO: Add support for accessing the earlier format:
  const [renderPDF, setRenderPDF] = useState(false);
  // const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const onLoadSuccess = (pdf) => {
    setPage(1);
    setPages(pdf.numPages);
  };
  const onPrev = () => {
    setPage((p) => {
      return Math.max(p - 1, 1);
    });
  };
  const onNext = () => {
    setPage((p) => {
      return Math.min(p + 1, pages);
    });
  };
	const parent = useRef(null);
	useEffect(() => {
		const resizeObserver = new ResizeObserver((event) => {
			// Depending on the layout, you may need to swap inlineSize with blockSize
			// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize
			// setWidth(event[0].contentBoxSize[0].inlineSize);
			setHeight(event[0].contentBoxSize[0].blockSize);
		});

    if(parent.current) {
      resizeObserver.observe(parent.current);
      return () => resizeObserver.disconnect()
    }
	}, [parent]);

  // TODO: add loading and error handling
  const onDownloadClick = () => {
    //setDownloadError(null)
    //const {id, name} = dwn
    apiservice.download(data.id)
      .then(blob => {
        var url = window.URL.createObjectURL(blob)
        var a = document.createElement('a')
        a.href = url
        a.download = data.name + '.pdf'
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch(e => {
        //setDownloadError('cant download ' + e)
      })
  }

  let options = useMemo(()=> {
    return {
      worker: new pdfjs.PDFWorker()
    }
  },[pdfjs])

  const [documentEnv, setDocumentEnv] = useState(null);
  useEffect(() => {
    if(renderPDF) {
      setDocumentEnv(null);
    } else {
      (async () => {
        const env = await generateDocumentEnvironment(file.id);
        setDocumentEnv(env);
        setPages(env.pageCount);
      })();
    }
  }, [file]);

  return (
    <>
      <Navbar style={{ marginLeft: '-12px' }}>
        { file && (<div><NameTag node={file} onSelect={onSelect} /></div>) }
      </Navbar>

      <Navbar>
        {pages > 1 && (
          <div>
            <ButtonGroup aria-label="Basic example">
              <Button size="sm" variant="outline-secondary" onClick={onPrev}><FaChevronLeft /></Button>
              <Button size="sm" variant="outline-secondary" onClick={onNext}><FaChevronRight /></Button>
            </ButtonGroup>
            <span style={{ margin: '0 10px' }}>
              Page: {page} of {pages}
            </span>
          </div>
        )}
        <div style={{ flex: 1 }}></div>

        <Button size="sm" onClick={onDownloadClick}>
          <AiOutlineDownload />
        </Button>

      </Navbar>

      {file && !renderPDF && (
        <RmLinesRenderer page={page - 1} environment={documentEnv} />
      )}
      {file && renderPDF && (
        <div ref={parent} style={{height: "95%"}}>
		      <Document file={downloadUrl} onLoadSuccess={onLoadSuccess} options={options}>
            <Page pageNumber={page} 
							// width={ width } 
							height={ height} 
							renderAnnotationLayer={false} 
							renderTextLayer={false}
						/>
          </Document>
        </div>
      )}
    </>
  );
}
