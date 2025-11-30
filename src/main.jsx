import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, FileText, CheckCircle, Settings, Download, 
  Menu, X, Clock, Award, ChevronRight, RefreshCw, Printer
} from 'lucide-react';

// Catatan: jsPDF dimuat via CDN di index.html untuk menghindari error build di lingkungan tertentu.
// Kita akan mengaksesnya melalui window.jspdf

// ==========================================
// 1. DATA BANK SOAL (JSON SCHEMA)
// ==========================================
const RAW_BANK_SOAL = [
  // KELAS 1 - MATEMATIKA
  { id: 'k1-mat-001', class: '1', subject: 'Matematika', type: 'pg', question: 'Hasil dari 5 + 3 adalah...', options: ['6', '7', '8', '9'], answer: 'C', competency: 'Penjumlahan bilangan sampai 10' },
  { id: 'k1-mat-002', class: '1', subject: 'Matematika', type: 'pg', question: 'Benda yang berbentuk lingkaran adalah...', options: ['Buku', 'Papan Tulis', 'Jam Dinding', 'Penggaris Segitiga'], answer: 'C', competency: 'Mengenal Bangun Datar' },
  { id: 'k1-mat-003', class: '1', subject: 'Matematika', type: 'isian', question: 'Lambang bilangan dari "dua belas" adalah ...', answer: '12', competency: 'Membaca dan menulis bilangan' },
  { id: 'k1-mat-004', class: '1', subject: 'Matematika', type: 'uraian', question: 'Ibu membeli 5 apel. Ayah membeli lagi 4 apel. Berapa jumlah apel sekarang? Jelaskan cara menghitungnya!', answer: '5 + 4 = 9 apel.', competency: 'Menyelesaikan masalah penjumlahan' },
  
  // KELAS 4 - IPAS
  { id: 'k4-ipas-001', class: '4', subject: 'IPAS', type: 'pg', question: 'Bagian tumbuhan yang berfungsi menyerap air dari tanah adalah...', options: ['Daun', 'Batang', 'Akar', 'Bunga'], answer: 'C', competency: 'Bagian Tubuh Tumbuhan' },
  { id: 'k4-ipas-002', class: '4', subject: 'IPAS', type: 'pg', question: 'Proses pembuatan makanan pada tumbuhan disebut...', options: ['Respirasi', 'Fotosintesis', 'Adaptasi', 'Reproduksi'], answer: 'B', competency: 'Fotosintesis' },
  { id: 'k4-ipas-003', class: '4', subject: 'IPAS', type: 'isian', question: 'Zat hijau daun disebut ...', answer: 'Klorofil', competency: 'Fotosintesis' },
  { id: 'k4-ipas-004', class: '4', subject: 'IPAS', type: 'uraian', question: 'Sebutkan 3 wujud zat dan berikan contohnya masing-masing!', answer: 'Padat (batu), Cair (air), Gas (udara/asap)', competency: 'Wujud Zat' },

  // KELAS 5 - B. INDONESIA
  { id: 'k5-indo-001', class: '5', subject: 'Bahasa Indonesia', type: 'pg', question: 'Ide pokok paragraf biasanya terdapat di...', options: ['Awal atau akhir kalimat', 'Tengah kata', 'Judul buku', 'Daftar isi'], answer: 'A', competency: 'Ide Pokok' },
  { id: 'k5-indo-002', class: '5', subject: 'Bahasa Indonesia', type: 'pg', question: 'Sinonim dari kata "Pintar" adalah...', options: ['Bodoh', 'Pandai', 'Malas', 'Lambat'], answer: 'B', competency: 'Sinonim Antonim' },
  { id: 'k5-indo-003', class: '5', subject: 'Bahasa Indonesia', type: 'isian', question: 'Kata tanya untuk menanyakan tempat adalah ...', answer: 'Dimana', competency: 'Kata Tanya' },
  { id: 'k5-indo-004', class: '5', subject: 'Bahasa Indonesia', type: 'uraian', question: 'Buatlah sebuah kalimat majemuk setara menggunakan kata hubung "dan"!', answer: 'Ibu memasak di dapur dan Ayah membaca koran di teras.', competency: 'Kalimat Majemuk' },
];

// Helper to populate more dummy data to reach strict counts
const generateDummyData = () => {
  const subjects = ['PAI', 'Pancasila', 'Bahasa Indonesia', 'PLBJ', 'Matematika', 'PJOK', 'Seni Rupa', 'IPAS', 'Bahasa Inggris'];
  const classes = ['1', '2', '3', '4', '5', '6'];
  const generated = [...RAW_BANK_SOAL];

  subjects.forEach(subj => {
    classes.forEach(cls => {
      // Add PG
      for (let i = 0; i < 20; i++) {
        generated.push({
          id: `gen-${cls}-${subj}-pg-${i}`, class: cls, subject: subj, type: 'pg',
          question: `Soal Latihan PG Nomor ${i+1} untuk ${subj} Kelas ${cls}. Topik Kurikulum Merdeka.`,
          options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
          answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          competency: `CP ${subj} Fase ${cls <= 2 ? 'A' : cls <= 4 ? 'B' : 'C'}`
        });
      }
      // Add Isian
      for (let i = 0; i < 15; i++) {
        generated.push({
          id: `gen-${cls}-${subj}-is-${i}`, class: cls, subject: subj, type: 'isian',
          question: `Soal Latihan Isian Nomor ${i+1} untuk ${subj} Kelas ${cls}. Isi titik-titik berikut...`,
          answer: `Jawaban Isian ${i+1}`,
          competency: `CP ${subj} Pemahaman Dasar`
        });
      }
      // Add Uraian
      for (let i = 0; i < 10; i++) {
        generated.push({
          id: `gen-${cls}-${subj}-ur-${i}`, class: cls, subject: subj, type: 'uraian',
          question: `Jelaskan secara rinci mengenai konsep ${i+1} pada mata pelajaran ${subj} Kelas ${cls}!`,
          answer: `Rubrik: Siswa menjelaskan konsep dengan benar (skor 5). Menjelaskan sebagian (skor 3).`,
          competency: `CP ${subj} Analisis & Aplikasi`
        });
      }
    });
  });
  return generated;
};

const BANK_SOAL = generateDummyData();

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const getQuestions = (cls, subject, counts = { pg: 15, isian: 10, uraian: 5 }) => {
  const pool = BANK_SOAL.filter(q => q.class === cls && q.subject === subject);
  const pg = shuffleArray(pool.filter(q => q.type === 'pg')).slice(0, counts.pg);
  const isian = shuffleArray(pool.filter(q => q.type === 'isian')).slice(0, counts.isian);
  const uraian = shuffleArray(pool.filter(q => q.type === 'uraian')).slice(0, counts.uraian);
  
  return { pg, isian, uraian, total: pg.length + isian.length + uraian.length };
};

// ==========================================
// 3. COMPONENTS
// ==========================================

const Navbar = ({ setView, currentView }) => (
  <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
          <BookOpen className="h-8 w-8 mr-2" />
          <span className="font-bold text-xl tracking-tight">MerdekaExam</span>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setView('home')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'home' ? 'bg-teal-800' : 'hover:bg-teal-600'}`}>Beranda</button>
          <button onClick={() => setView('generator')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'generator' ? 'bg-teal-800' : 'hover:bg-teal-600'}`}>Generator Soal</button>
          <button onClick={() => setView('quiz')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'quiz' ? 'bg-teal-800' : 'hover:bg-teal-600'}`}>Quiz Siswa</button>
        </div>
      </div>
    </div>
  </nav>
);

const Home = ({ setView }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center mb-16">
      <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
        Platform Asesmen <span className="text-primary">Kurikulum Merdeka</span>
      </h1>
      <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
        Buat soal ujian (STS/SAS/SAT) otomatis dan latihan kuis interaktif untuk siswa SD Kelas 1-6.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
      <div 
        onClick={() => setView('generator')}
        className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition cursor-pointer group"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-secondary rounded-full p-3 shadow-md group-hover:scale-110 transition">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Generator Soal Ujian</h3>
        <p className="mt-4 text-gray-500">
          Hasilkan file PDF siap cetak lengkap dengan kop, butir soal (PG, Isian, Uraian), dan kunci jawaban.
        </p>
        <span className="mt-6 inline-flex items-center text-primary font-semibold">Mulai Buat <ChevronRight className="h-4 w-4 ml-1" /></span>
      </div>

      <div 
        onClick={() => setView('quiz')}
        className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition cursor-pointer group"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-teal-600 rounded-full p-3 shadow-md group-hover:scale-110 transition">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Quiz Interaktif</h3>
        <p className="mt-4 text-gray-500">
          Mode latihan untuk siswa dengan timer, scoring otomatis, dan pembahasan instan.
        </p>
        <span className="mt-6 inline-flex items-center text-primary font-semibold">Mulai Quiz <ChevronRight className="h-4 w-4 ml-1" /></span>
      </div>
    </div>
  </div>
);

// --- GENERATOR MODULE ---
const ExamGenerator = () => {
  const [config, setConfig] = useState({
    grade: '1',
    subject: 'Matematika',
    examType: 'STS Ganjil', // STS, SAS, SAT
    schoolName: 'SD NEGERI CONTOH 01',
    date: new Date().toISOString().split('T')[0]
  });
  const [generated, setGenerated] = useState(null);

  const handleGenerate = () => {
    const questions = getQuestions(config.grade, config.subject);
    setGenerated({ ...questions, config: { ...config } });
  };

  const downloadPDF = () => {
    if (!generated) return;
    
    // AKSES jsPDF via CDN (window object)
    if (!window.jspdf) {
      alert("Library PDF belum termuat sempurna. Mohon refresh halaman.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const { config, pg, isian, uraian } = generated;
    let yPos = 20;

    // Helper for adding text with auto-page break
    const addText = (text, x, y, options = {}) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(text, x, y, options);
      return y + (options.lineHeight || 7);
    };

    // --- SOAL PAGE ---
    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    yPos = addText(`NASKAH SOAL ${config.examType.toUpperCase()}`, 105, yPos, { align: 'center' });
    yPos = addText(config.schoolName, 105, yPos, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.line(10, yPos, 200, yPos);
    yPos += 10;
    
    doc.text(`Mata Pelajaran : ${config.subject}`, 10, yPos);
    doc.text(`Kelas : ${config.grade}`, 140, yPos);
    yPos += 7;
    doc.text(`Hari/Tanggal   : ${config.date}`, 10, yPos);
    yPos += 15;

    // A. Pilihan Ganda
    doc.setFont("helvetica", "bold");
    yPos = addText("A. PILIHAN GANDA", 10, yPos);
    doc.setFont("helvetica", "normal");
    
    pg.forEach((q, idx) => {
      const splitQuestion = doc.splitTextToSize(`${idx + 1}. ${q.question}`, 180);
      yPos = addText(splitQuestion, 10, yPos, { lineHeight: 5 });
      
      q.options.forEach((opt, optIdx) => {
        const label = String.fromCharCode(65 + optIdx); // A, B, C, D
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.text(`${label}. ${opt}`, 15, yPos);
        yPos += 5;
      });
      yPos += 3;
    });

    // B. Isian
    yPos += 5;
    if (yPos > 260) { doc.addPage(); yPos = 20; }
    doc.setFont("helvetica", "bold");
    yPos = addText("B. ISIAN SINGKAT", 10, yPos);
    doc.setFont("helvetica", "normal");
    
    isian.forEach((q, idx) => {
      const splitQuestion = doc.splitTextToSize(`${idx + 1}. ${q.question}`, 180);
      yPos = addText(splitQuestion, 10, yPos, { lineHeight: 6 });
      yPos += 2;
    });

    // C. Uraian
    yPos += 5;
    if (yPos > 260) { doc.addPage(); yPos = 20; }
    doc.setFont("helvetica", "bold");
    yPos = addText("C. URAIAN", 10, yPos);
    doc.setFont("helvetica", "normal");
    
    uraian.forEach((q, idx) => {
      const splitQuestion = doc.splitTextToSize(`${idx + 1}. ${q.question}`, 180);
      yPos = addText(splitQuestion, 10, yPos, { lineHeight: 6 });
      yPos += 10; // Space for answer
    });

    // --- KUNCI JAWABAN PAGE ---
    doc.addPage();
    yPos = 20;
    doc.setFont("helvetica", "bold");
    yPos = addText(`KUNCI JAWABAN - ${config.subject} Kelas ${config.grade}`, 105, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.text("PILIHAN GANDA", 10, yPos);
    yPos += 7;
    // Simple grid for PG keys
    let pgKeyText = "";
    pg.forEach((q, i) => {
      pgKeyText += `${i+1}.${q.answer}   `;
      if ((i+1) % 5 === 0) pgKeyText += "\n";
    });
    doc.setFont("helvetica", "normal");
    yPos = addText(pgKeyText, 10, yPos, { lineHeight: 6 });

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("JAWABAN ISIAN", 10, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    isian.forEach((q, i) => {
      yPos = addText(`${i+1}. ${q.answer}`, 10, yPos, { lineHeight: 6 });
    });

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("PEDOMAN PENSKORAN URAIAN", 10, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    uraian.forEach((q, i) => {
      const splitAns = doc.splitTextToSize(`${i+1}. ${q.answer}`, 180);
      yPos = addText(splitAns, 10, yPos, { lineHeight: 6 });
    });

    doc.save(`Soal_${config.subject}_Kelas${config.grade}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Settings className="mr-2" /> Konfigurasi Soal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Penilaian</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={config.examType} onChange={(e) => setConfig({...config, examType: e.target.value})}>
              <option value="STS Ganjil">Sumatif Tengah Semester (Ganjil)</option>
              <option value="SAS Ganjil">Sumatif Akhir Semester (Ganjil)</option>
              <option value="STS Genap">Sumatif Tengah Semester (Genap)</option>
              <option value="SAT Genap">Sumatif Akhir Tahun (Genap)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={config.subject} onChange={(e) => setConfig({...config, subject: e.target.value})}>
              {['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pancasila', 'Seni Rupa', 'PJOK', 'Bahasa Inggris', 'PLBJ', 'PAI'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kelas</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={config.grade} onChange={(e) => setConfig({...config, grade: e.target.value})}>
              {[1,2,3,4,5,6].map(c => <option key={c} value={c}>Kelas {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={config.schoolName} onChange={(e) => setConfig({...config, schoolName: e.target.value})} />
          </div>
        </div>
        <div className="mt-6">
          <button onClick={handleGenerate} className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-teal-800 transition flex justify-center items-center font-bold shadow-lg">
            <RefreshCw className="mr-2 h-5 w-5" /> Generate Paket Soal
          </button>
        </div>
      </div>

      {generated && (
        <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-secondary animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Preview Soal Tergenerate</h3>
              <p className="text-sm text-gray-500">Total: {generated.total} Butir Soal</p>
            </div>
            <button onClick={downloadPDF} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 flex items-center">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </button>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto pr-2 border rounded p-4 bg-gray-50">
            <div>
              <h4 className="font-bold text-primary mb-2">A. Pilihan Ganda (Sample 3)</h4>
              {generated.pg.slice(0, 3).map((q, i) => (
                <div key={q.id} className="mb-2 text-sm border-b pb-2">
                  <p>{i+1}. {q.question}</p>
                  <div className="ml-4 text-gray-600 text-xs mt-1 grid grid-cols-2 gap-1">
                    {q.options.map((opt, oi) => <span key={oi}>{String.fromCharCode(65+oi)}. {opt}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Preview dibatasi. Download PDF untuk melihat 100% soal.</p>
        </div>
      )}
    </div>
  );
};

// --- QUIZ MODULE ---
const QuizMode = () => {
  const [gameState, setGameState] = useState('setup'); // setup, playing, finished
  const [quizData, setQuizData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { qId: userAns }
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);

  // Setup Form
  const [setup, setSetup] = useState({ class: '1', subject: 'Matematika', count: 10 });

  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const startQuiz = () => {
    const rawData = getQuestions(setup.class, setup.subject, { pg: setup.count, isian: 0, uraian: 0 });
    setQuizData(rawData.pg); // Only PG for auto-scoring quiz MVP
    setGameState('playing');
    setTimer(0);
    setCurrentQ(0);
    setAnswers({});
  };

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [quizData[currentQ].id]: val });
  };

  const finishQuiz = () => {
    // Calculate Score
    let correct = 0;
    quizData.forEach(q => {
      if (answers[q.id] === q.answer) correct++;
    });
    setScore(Math.round((correct / quizData.length) * 100));
    setGameState('finished');
    
    // Save to local storage (Simple History)
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    history.push({
      date: new Date().toLocaleString(),
      subject: setup.subject,
      score: Math.round((correct / quizData.length) * 100)
    });
    localStorage.setItem('quizHistory', JSON.stringify(history));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const exportResultPDF = () => {
    // AKSES jsPDF via CDN
    if (!window.jspdf) {
      alert("Library PDF belum termuat sempurna.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("HASIL KUIS SISWA", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Mapel: ${setup.subject} | Kelas: ${setup.class}`, 105, 30, { align: 'center' });
    doc.text(`Nilai Akhir: ${score}`, 105, 40, { align: 'center' });
    
    const tableData = quizData.map((q, i) => [
      i + 1,
      q.question.substring(0, 40) + '...',
      answers[q.id] || '-',
      q.answer,
      answers[q.id] === q.answer ? 'BENAR' : 'SALAH'
    ]);

    doc.autoTable({
      head: [['No', 'Soal', 'Jawaban Siswa', 'Kunci', 'Status']],
      body: tableData,
      startY: 50,
      theme: 'grid'
    });
    doc.save('Hasil_Kuis.pdf');
  };

  if (gameState === 'setup') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-8">
        <h2 className="text-2xl font-bold text-center mb-6">Mulai Kuis Baru</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Kelas</label>
            <select className="w-full border p-2 rounded" value={setup.class} onChange={e => setSetup({...setup, class: e.target.value})}>
              {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Mata Pelajaran</label>
            <select className="w-full border p-2 rounded" value={setup.subject} onChange={e => setSetup({...setup, subject: e.target.value})}>
              {['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pancasila'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={startQuiz} className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-yellow-500 transition shadow">
            Mulai Mengerjakan
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = quizData[currentQ];
    return (
      <div className="max-w-2xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-4 text-gray-600 font-mono">
          <span>Soal {currentQ + 1} / {quizData.length}</span>
          <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {formatTime(timer)}</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <p className="text-lg font-medium mb-6">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const optLabel = String.fromCharCode(65 + i);
              const isSelected = answers[q.id] === optLabel;
              return (
                <div 
                  key={i} 
                  onClick={() => handleAnswer(optLabel)}
                  className={`p-3 border rounded-lg cursor-pointer transition flex items-center ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 text-sm font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {optLabel}
                  </span>
                  {opt}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button 
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(c => c - 1)}
            className="px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          {currentQ < quizData.length - 1 ? (
            <button 
              onClick={() => setCurrentQ(c => c + 1)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-teal-700"
            >
              Selanjutnya
            </button>
          ) : (
            <button 
              onClick={finishQuiz}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
            >
              Selesai & Nilai
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center mt-12 bg-white p-8 rounded-xl shadow-xl">
      <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-gray-900">Kuis Selesai!</h2>
      <p className="text-gray-500 mb-6">Anda menyelesaikan kuis dalam {formatTime(timer)}</p>
      
      <div className="text-6xl font-black text-primary mb-8">{score}</div>
      
      <div className="space-y-3">
        <button onClick={exportResultPDF} className="w-full border-2 border-gray-300 py-2 rounded-lg font-bold hover:bg-gray-50 flex justify-center items-center">
          <Download className="w-4 h-4 mr-2"/> Download Hasil (PDF)
        </button>
        <button onClick={() => setGameState('setup')} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-teal-700">
          Main Lagi
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar setView={setView} currentView={view} />
      <main>
        {view === 'home' && <Home setView={setView} />}
        {view === 'generator' && <ExamGenerator />}
        {view === 'quiz' && <QuizMode />}
      </main>
      
      <footer className="fixed bottom-0 w-full bg-white border-t py-4 text-center text-xs text-gray-500 no-print">
        &copy; {new Date().getFullYear()} MerdekaExam Generator. Dibuat untuk Pendidikan Indonesia.
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
export default App;
