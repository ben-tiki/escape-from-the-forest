import tiktoken

def count_tokens(string: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding("cl100k_base")
    num_tokens = len(encoding.encode(string))
    return num_tokens


def truncate_conversation(messages: list, max_tokens: int) -> list:
    """Truncates a conversation to a maximum number of tokens."""
    total_tokens = 0
    for message in messages:
        total_tokens += count_tokens(message["content"])
        
    if total_tokens <= max_tokens:
        return messages

    truncated_messages = [messages[0]]  # keep the system message
    for message in messages[1:]:
        message_tokens = count_tokens(message["content"])
        if total_tokens - message_tokens >= max_tokens:
            total_tokens -= message_tokens
        else:
            truncated_messages.append(message)
            
    return truncated_messages
