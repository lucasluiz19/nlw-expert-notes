import * as Dialog from '@radix-ui/react-dialog';
import {X} from 'lucide-react'
import {toast} from 'sonner'
import { ChangeEvent, FormEvent, useState } from 'react';

interface NewNoteCardProps{
  onNoteCreated:(content: string )=> void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard ({onNoteCreated}: NewNoteCardProps){
  const [isRecording, setIsRecording]=useState(false)
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent]= useState('')
  
  function handleStartEditor(){
    setShouldShowOnboarding(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){
    setContent(event.target.value)
    if(event.target.value == ''){
      (setShouldShowOnboarding(true))
    }
  }

  

  function handleSaveNote(event: FormEvent){
    event.preventDefault()
    if(content===''){
      return
    }

    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true)

    toast.success('nota criada com sucesso!')
    
  }

  function handleStartingRecording(){
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable){
      alert('infelizmente seu navegador não suporta essa API de gravação!')
      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI= window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang='pt-BR'
    speechRecognition.continuous=true
    speechRecognition.maxAlternatives=1
    speechRecognition.interimResults=true

    speechRecognition.onresult= (event)=>{
      const transcription = Array.from(event.results).reduce((text, result)=>{
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror=(event)=>{
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording(){
    setIsRecording(false)

    if(speechRecognition !== null){
      speechRecognition.stop()
    }
  }
    return(
      <Dialog.Root>
          <Dialog.Trigger className="text-left flex flex-col rounded-md bg-slate-700 p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 " >
            <span className="text-sm font-medium text-slate-200 ">
            Adicionar nota
            </span>

            <p className="text-sm text-slate-400 font-normal leading-6">
            Grave uma nota em áudio que será convertida para texto automaticamente.
            </p>

          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="inset-0 fixed bg-black/50 " />
            <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md  flex flex-col outline-none '>
              <Dialog.Close className='absolute right-0 top-0 p-1.5 text-slate-400  bg-slate-800 hover:text-slate-100  '>
                <X className='size-5  '/>
              </Dialog.Close>
              <form  className='flex  flex-1 flex-col'>
                <div className='flex flex-1 flex-col gap-3 p-5'>
                    <span className="text-sm font-medium text-slate-300 ">
                      Adicionar nota
                    </span>

                    {shouldShowOnboarding ? (
                      <p className="text-sm text-slate-400 font-normal leading-6">
                        Comece <button type='button' onClick={handleStartingRecording} className='text-lime-400 font-medium hover:underline ' >gravando uma nota </button> em áudio ou se preferir <button type='button' onClick={handleStartEditor} className='text-lime-400 font-medium hover:underline '> utilize apenas texto</button>.
                      </p>
                      ):(
                        <textarea 
                          autoFocus
                          className='text-sm text-slate-400 bg-transparent resize-none flex-1 outline-none'
                          onChange={handleContentChange}
                          value={content}
                        />
                      )
                    }
                </div>

                {
                  isRecording ?(
                    <button 
                      type='button'
                      onClick={handleStopRecording}
                      className='flex  w-full gap-3 justify-center items-center bg-slate-900    text-slate-300   py-4 text-center font-medium  outline-none hover:text-slate-100 '
                    >
                      <div className='size-3 bg-red-500 rounded-full animate-pulse' />
                      Gravando (clique p/ interromper)
                    </button>
                  ) : (
                      <button 
                        type='button'
                        onClick={handleSaveNote}
                        className='w-full bg-lime-400   text-lime-950  py-4 text-center font-medium  outline-none hover:bg-lime-500 '
                      >
                        Salvar nota
                      </button>
                    )
                }
                
              </form>
            </Dialog.Content>
          </Dialog.Portal>
              
      </Dialog.Root>
    )

}