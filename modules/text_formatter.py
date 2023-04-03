def format_text(answer: str) -> str:
    
    answer = answer.rstrip()

    if answer[-1] not in ['.', '!', '?']:
            
            answer += '.'
        
    return answer.upper()