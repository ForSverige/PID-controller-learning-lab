# 🎓 PID Controller Learning Lab

An interactive Streamlit-based platform for mastering PID control through hands-on simulation and real-time tuning challenges.

## 📋 Overview

This repository contains a comprehensive educational tool designed to demystify PID (Proportional-Integral-Derivative) controllers. Whether you're a student learning control theory, an engineer prototyping embedded systems, or a maker exploring automation, this lab provides intuitive visualizations and guided challenges to build deep practical understanding.

### Key Features

- **Progressive Learning Mode**: Build PID understanding step-by-step by tuning P, I, and D parameters individually
- **Interactive Visualizations**: Real-time plotting of system response with side-by-side parameter comparisons
- **Tuning Challenges**: Beat a baseline controller across multiple test scenarios (single-step, double-step, triple-step)
- **Performance Metrics**: Track settling time, overshoot, steady-state error, oscillation count, and control smoothness
- **Smart Hints**: Context-aware guidance based on your current tuning performance
- **Educational Plant Model**: Deliberately designed with exaggerated dynamics (underdamped 2nd-order system) to clearly demonstrate how each PID term affects response

## 🛠️ Tech Stack

- **Streamlit** – Interactive web framework for the UI
- **NumPy** – Numerical computations and system simulation
- **SciPy** – Scientific computing utilities
- **Matplotlib** – Real-time plotting and visualizations
- **Control** – Control systems analysis (optional)
- **Pandas** – Data handling

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pid-controller-learning-lab.git
cd pid-controller-learning-lab
```

2. Install dependencies:
```bash
pip install streamlit numpy scipy matplotlib control pandas
```

### Running Locally

```bash
streamlit run pid_app.py
```

The app will launch at `http://localhost:8501`

### Cloud Deployment Options

#### Option 1: Streamlit Community Cloud (Recommended)
The easiest way to deploy your Streamlit app for free:

1. Push your code to GitHub
2. Go to [Streamlit Community Cloud](https://streamlit.io/cloud)
3. Click "New app" and connect your GitHub repository
4. Select the main file (`pid_app.py`)
5. Your app will be live within minutes!

#### Option 2: Google Cloud Run
For production-grade deployment on Google Cloud:[1]

1. Create a `Dockerfile`:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 8080
CMD ["streamlit", "run", "--server.port=8080", "pid_app.py"]
```

2. Deploy using Google Cloud CLI:
```bash
gcloud run deploy pid-lab --source . --platform managed
```

#### Option 3: Google AI Studio
Use Google AI Studio to run the notebook-based version directly in your browser—no additional setup required.

#### Option 4: Heroku, AWS, or Azure
Alternative cloud platforms with detailed setup guides available in the Streamlit documentation.

## 📚 How to Use

### Learn Mode
- Start with **P (Proportional)**: Adjust Kp to see how it affects response speed and overshoot
- Add **I (Integral)**: Use Ki to eliminate steady-state error and offset
- Finish with **D (Derivative)**: Tune Kd to dampen oscillations and smooth response
- Choose challenges of increasing difficulty as you progress

### Tune Mode
- Optimize all three parameters simultaneously
- Compete against a baseline bang-bang controller
- Metrics include accuracy, overshoot, and control smoothness
- Test scenarios range from simple step changes to complex multi-step profiles

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- **Report Bugs**: Open an issue describing the problem and steps to reproduce
- **Suggest Features**: Share ideas for new learning scenarios or visualization improvements
- **Improve Documentation**: Help clarify explanations or add more educational content
- **Optimize Code**: Suggest performance improvements or better simulation models

Please fork the repository, create a feature branch, and submit a pull request.

## 📄 License

This project is licensed under the MIT License – see the LICENSE file for details.

## 🎯 Project Goals

- Make PID control theory accessible and intuitive
- Provide hands-on experience without heavy mathematical prerequisites
- Support both self-directed learning and classroom instruction
- Demonstrate real-world control challenges and tradeoffs

## 💡 Quick Tips

| Metric | How to Improve |
|--------|----------------|
| Slow response | **Increase Kp** |
| Steady-state error | **Increase Ki** |
| Oscillations | **Increase Kd** |
| Smooth control | **Reduce Ki & Kp** |

---

**Have feedback or suggestions?** Open an issue or reach out – we'd love to hear how you're using this lab!
